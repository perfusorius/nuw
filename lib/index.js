var os      = require('os'),
    fs      = require('fs'),
    path    = require('path'),
    cproc   = require('child_process'),
    semver  = require('semver'),
    request = require('request');

var base_url = 'http://nodejs.org/dist/',
    min_ver = '0.7.11';

function install (msi) {
    var params = ['/i', msi, '/passive'],
        opts = {
            detached: true,
            stdio: 'ignore'
        };

    console.log('Installing "%s" ...', path.basename(msi));
    cproc.spawn('msiexec', params, opts).unref();
}

function download (ver, cb) {
    var url = base_url + 'v' + ver + '/',
        fname = 'node-v' + ver;

    switch (os.arch().toString()) {
        case 'ia32':
            fname += '-x86.msi';
            url += fname;
            break;
        case 'x64':
            fname += '-x64.msi';
            url += 'x64/' + fname;
            break;
        default:
            cb()
            console.log('Fehler');
            return;
    }

    var target = path.join(os.tmpDir(), fname);

    if (fs.existsSync(target)) {
        console.log('Skip downloading "%s", file\'s already there', ver);
        cb(null, target);
    }
    else {
        console.log('Downloading "%s" ...', ver);

        request(url).on('end', function () {
            cb(null, target);
        }).on('error', function (err) {
            cb(err);
        }).pipe(fs.createWriteStream(target));
    }
}

function dl_and_install (ver, cb) {
    download(ver, function (err, file) {
        if (err) {
            return cb(err);
        }
        install(file);
    });
}

function downgrade (current, older, cb) {
    download(current, function (err, current_file) {
        if (err) {
            return cb(err);
        }
        download(older, function (err, older_file) {
            if (err) {
                return cb(err);
            }
            var cmd = path.join(__dirname, '..', 'bin', 'replace.cmd'),
                opts = {
                    detached: true,
                    stdio: 'ignore'
                };
            cproc.spawn(cmd, [current_file, older_file], opts).unref();
        });
    });
}

function isStableVersion (ver) {
    return (ver.split('.')[1] % 2 == 0);
}

function getLatest (versions, onlyStable, cb) {
    var currVer = '0.0.0',
        maxVer = '0.0.0';
    
    for (var i = 0, l = versions.length; i < l; i++) {
        currVer = versions[i];
        if (!onlyStable || isStableVersion(currVer)) {
            if (semver.gt(currVer, maxVer)) {
                maxVer = currVer;
            }
        }
    }
    cb(maxVer);
}

function getVersions (cb) {
    request(base_url, function (error, response, body) {
        if (error) {
            cb(error);
        }
        else if (!error && response.statusCode == 200) {
            var rx_anchor = /<a href="v[\d\.]+\/">/g,
                rx_ver = /^.*v(\d+\.\d+\.\d+).*$/g,
                versions = [],
                strings, ver, v;
            if (strings = body.match(rx_anchor)) {
                for (var i = 0, l = strings.length; i < l; i++) {
                    ver = strings[i].toString().replace(os.EOL, '');
                    v = semver.valid(ver.replace(rx_ver, '$1'));
                    if (v && semver.gte(v, min_ver)) {
                        versions.push(v);
                    }
                }
                cb(null, versions.sort(semver.compare));
            }
            else {
                cb('No versions could be found!');
            }
        }
        else {
            cb({
                'msg': 'Error while fetching versions from nodejs.org',
                'statusCode': response.statusCode
            });
        }
    });
}

function getLatestVersion (cb) {
    getVersions(function (err, data) {
        (err) ? cb(err) : getLatest(data, false, function (maxVer) {
            cb(null, maxVer);
        });
    });
}

function getLatestStableVersion (cb) {
    getVersions(function (err, data) {
        (err) ? cb(err) : getLatest(data, true, function (maxVer) {
            cb(null, maxVer);
        });
    });
}

function getCurrentVersion (cb) {
    var cmd = cproc.spawn('node', ['-v']),
        _data = {},
        _err = null;

    cmd.stdout.on('data', function (data) {
        _data.ver = semver.valid(data.toString());
        _data.type = isStableVersion(_data.ver) ? 'stable' : 'unstable';
    });

    cmd.stderr.on('data', function (data) {
        _err = data;
    });

    cmd.on('exit', function (code) {
        cb(_err, _data, code);
    });
}

function checkIfNewest (cb) {
    var current = '',
        fn;
    getCurrentVersion(function (err, current, rc) {
        if (err) {
            return cb(err);
        }
        fn = (current.type === 'stable') ? getLatestStableVersion : getLatestVersion;
        fn(function (err, latest) {
            if (err) {
                return cb(err);
            }
            if (semver.gt(latest, current.ver)) {
                cb(null, {
                    'newer': true,
                    'current': current.ver,
                    'latest': latest
                });
            }
            else {
                cb(null, {
                    'newer': false,
                    'current': current.ver,
                });
            }
        })
    });
}

function isValidVersion (ver) {
    return !!semver.valid(ver);
}

function update (ver, cb) {
    var fn;
    if (!ver || ver === 'latest' || ver === 'stable') {
        // !ver = update to latest, according to type
        // latest = update to latest, ignoring current type
        // stable = update to latest stable, ignoring current type
        getCurrentVersion(function (err, current) {
            if (err) {
                return cb(err);
            }
            var stbl = (!ver) ? (current.type === 'stable') : (ver === 'stable');
            fn = (stbl) ? getLatestStableVersion : getLatestVersion;
            fn(function (err, ver) {
                if (err) {
                    cb(err);
                }
                else if (semver.lt(ver, current.ver)) {
                    downgrade(current.ver, ver, cb);
                }
                else if (semver.eq(ver, current.ver)) {
                    cb(null, 'The latest version "' + ver + '" is already installed');
                }
                else {
                    dl_and_install(ver, cb);
                }
            });
        });
    }
    else {
        if (semver.lt(ver, min_ver)) {
            return cb(null, 'Node versions before ' + min_ver + ' are not supported by this tool');
        }
        // update to <ver>, ignoring current type
        getCurrentVersion(function (err, current) {
            if (err) {
                cb(err);
            }
            else if (semver.lt(ver, current.ver)) {
                downgrade(current.ver, ver, cb);
            }
            else if (semver.eq(ver, current.ver)) {
                cb(null, 'Version "' + ver + '" is already installed');
            }
            else {
                dl_and_install(ver, cb);
            }
        });
    }
}

module.exports = {
    getVersions: getVersions,
    getLatestVersion: getLatestVersion,
    getLatestStableVersion: getLatestStableVersion,
    getCurrentVersion: getCurrentVersion,
    checkIfNewest: checkIfNewest,
    isValidVersion: isValidVersion,
    update: update
}