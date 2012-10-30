var lib = require('./lib'),
    os = require('os');

if (os.platform() !== 'win32') {
    return console.log('Attention: nuw runs only on Windows');
}

function printHelp () {
    var help = 'nuw - Node Updater for Windows' + os.EOL
    + '' + os.EOL
    + 'Syntax:' + os.EOL
    + 'nuw                Output currently installed version' + os.EOL
    + 'nuw ls             Output all versions of node available' + os.EOL
    + 'nuw show           Output the latest and the latest stable node version available' + os.EOL
    + 'nuw show-latest    Output the latest node version available' + os.EOL
    + 'nuw show-stable    Output the latest stable node version available' + os.EOL
    + 'nuw check          Check for newer release (respects currently installed type)' + os.EOL
    + 'nuw update         Install the latest (stable) release (respects currently installed type)' + os.EOL
    + 'nuw latest         Install the latest node release (ignores currently installed type)' + os.EOL
    + 'nuw stable         Install the latest stable node release (ignores currently installed type)' + os.EOL
    + 'nuw <ver>          Install specific version, e.g. 0.8.10 (ignores currently installed type)' + os.EOL
    + 'nuw help           Display help information (this screen)' + os.EOL;
    console.log(help);
}

function errLog (err) {
    console.log('An error occured:', err);
}

var args = process.argv,
    argl = args.length;
if (argl === 2) {
    lib.getCurrentVersion(function (err, data, rc) {
        if (err) {
            return errLog(err);
        }
        console.log('Your current version:', data.ver, '(type: ' + data.type + ')');
    });
}
else if (argl > 2) {

    switch (args[2]) {

        case 'ls':
            lib.getVersions(function (err, versions) {
                if (err) {
                    return errLog(err);
                }
                console.log('All available versions on nodejs.org:' + os.EOL, versions.join(os.EOL));
            });
           break;

        case 'show':
            console.log('Fetching latest versions from nodejs.org...');
            lib.getLatestStableVersion(function (err, stable) {
                if (err) {
                    return errLog(err);
                }
                lib.getLatestVersion(function (err, latest) {
                    if (err) {
                        return errLog(err);
                    }
                    console.log('Latest available stable version:', stable);
                    console.log('Latest available version:', latest);
                });
            });
           break;

        case 'show-latest':
            console.log('Fetching latest version from nodejs.org...');
            lib.getLatestVersion(function (err, latest) {
                if (err) {
                    return errLog(err);
                }
                console.log('Latest available version:', latest);
            });
           break;

        case 'show-stable':
            console.log('Fetching latest stable version from nodejs.org...');
            lib.getLatestStableVersion(function (err, latest) {
                if (err) {
                    return errLog(err);
                }
                console.log('Latest available stable version:', latest);
            });
            break;

        case 'check':
            lib.checkIfNewest(function (err, data) {
                if (err) {
                    return errLog(err);
                }
                if (data.newer) {
                    console.log('Your version "%s" is outdated, latest version is "%s"', data.current, data.latest);
                }
                else {
                    console.log('Your version "%s" is up to date', data.current);
                }
            })
            break;

        case 'update':
            console.log('Updating ...');
            lib.update(null, function (err, msg) {
                if (err) {
                    return errLog(err);
                }
                console.log(msg);
            });
            break;

        case 'latest':
            console.log('Updating to latest version ...');
            lib.update('latest', function (err, msg) {
                if (err) {
                    return errLog(err);
                }
                console.log(msg);
            });
            break;

        case 'stable':
            console.log('Updating to latest stable version ...');
            lib.update('stable', function (err, msg) {
                if (err) {
                    return errLog(err);
                }
                console.log(msg);
            });
            break;

        case 'help':
            printHelp();
            break;

        default:
            var ver = args[2];
            if (lib.isValidVersion(ver)) {
                console.log('Updating to version "%s" ...', ver);
                lib.update(ver, function (err, msg) {
                    if (err) {
                        return errLog(err);
                    }
                    console.log(msg);
                });
            }
            else {
                printHelp();
            }
            break;

    }

}