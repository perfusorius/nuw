var lib = require('./lib'),
    os = require('os');

if (os.platform() !== 'win32') {
    return console.log('Attention: nuw runs only on Windows');
}

function getNuwVer () {
    return require('./package.json').version;
}

function printHelp () {
    var help = 'nuw - Node Updater for Windows' + os.EOL
    + 'Version: ' + getNuwVer() + os.EOL
    + os.EOL
    + 'Syntax:' + os.EOL
    + os.EOL
    + 'nuw                Output currently installed node version' + os.EOL
    + 'nuw ls             Output all versions of node available' + os.EOL
    + 'nuw show           Output the latest and the latest stable node version available' + os.EOL
    + 'nuw show latest    Output the latest node version available' + os.EOL
    + 'nuw show stable    Output the latest stable node version available' + os.EOL
    + os.EOL
    + 'nuw check          Check for newer release (respects currently installed type)' + os.EOL
    + os.EOL
    + 'nuw update         Install the latest (stable) release (respects currently installed type)' + os.EOL
    + 'nuw latest         Install the latest node release (ignores currently installed type)' + os.EOL
    + 'nuw stable         Install the latest stable node release (ignores currently installed type)' + os.EOL
    + 'nuw <ver>          Install specific version, e.g. 0.8.10 (ignores currently installed type)' + os.EOL
    + os.EOL
    + 'nuw ver            Output version of nuw' + os.EOL
    + 'nuw help           Display help information (this screen)';
    console.log(help);
}

function errLog (err) {
    if (err) {
        console.log('An error occured:', err);
        process.exit();
    }
}

function show (what) {
    var _stable, _latest;
    if (!what.match(/^(both|stable|latest)$/)) {
        return printHelp();
    }
    console.log('Fetching info from nodejs.org ...');
    var result = function () {
        if (what === 'both' && (!_stable || !_latest)) {
            return;
        }
        if (what.match(/^(both|stable)$/)) {
            console.log('Latest available stable version:', _stable);
        }
        if (what.match(/^(both|latest)$/)) {
            console.log('Latest available version:', _latest);
        }
    }
    if (what.match(/^(both|stable)$/)) {
        lib.getLatestStableVersion(function (err, stable) {
            errLog(err);
            _stable = stable;
            result();
        });
    }
    if (what.match(/^(both|latest)$/)) {
        lib.getLatestVersion(function (err, latest) {
            errLog(err);
            _latest = latest;
            result();
        });
    }
}

var args = process.argv,
    argl = args.length;
if (argl === 2) {
    lib.getCurrentVersion(function (err, data, rc) {
        errLog(err);
        console.log('Your current version:', data.ver, '(type:', data.type + ')');
    });
}
else if (argl > 2) {

    switch (args[2]) {

        case 'ls':
            lib.getVersions(function (err, versions) {
                errLog(err);
                console.log('All available versions on nodejs.org:' + os.EOL + versions.join(os.EOL));
            });
           break;

        case 'show':
            (args[3]) ? show(args[3]) : show('both');
           break;

        case 'show-latest':
            show('latest');
           break;

        case 'show-stable':
            show('stable');
            break;

        case 'check':
            lib.checkIfNewest(function (err, data) {
                errLog(err);
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
                errLog(err);
                console.log(msg);
            });
            break;

        case 'latest':
            console.log('Updating to latest version ...');
            lib.update('latest', function (err, msg) {
                errLog(err);
                console.log(msg);
            });
            break;

        case 'stable':
            console.log('Updating to latest stable version ...');
            lib.update('stable', function (err, msg) {
                errLog(err);
                console.log(msg);
            });
            break;

        case 'help':
            printHelp();
            break;

        case 'ver':
            console.log('nuw Version:', getNuwVer());
            break;

        default:
            var ver = args[2];
            if (lib.isValidVersion(ver)) {
                console.log('Updating to version "%s" ...', ver);
                lib.update(ver, function (err, msg) {
                    errLog(err);
                    console.log(msg);
                });
            }
            else {
                printHelp();
            }
            break;

    }

}