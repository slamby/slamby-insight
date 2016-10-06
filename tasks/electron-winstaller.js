const electronInstaller = require('electron-winstaller');
const path = require('path');
const pkginfo = require('pkginfo')(module);

createInstaller('win32-x64')
    //.then(() => createInstaller('win32-ia32'))
    .then(() => console.log("Install created!"))
    .catch((e) => {
            console.log(`Error occured: ${e.message}`);
            process.exit(1);
        }
    );

function createInstaller(platform) {
    var appName = module.exports.name;
    var setupExeName = `${appName}-${module.exports.version}-${platform}.exe`;
    var appDir = path.join(__dirname, '..', 'packager', `${appName}-${platform}`);
    //var installerDir = path.join(__dirname, '..', 'installer', `${appName}-${platform}`);
    var installerDir = path.join(__dirname, '..', 'installer');
    var iconDir = path.join(__dirname, '..', 'src', 'assets', 'icons', 'icon.ico');

    console.log(`Creating installer for ${platform} started...`);

    var resultPromise = electronInstaller.createWindowsInstaller({
        appDirectory: appDir,
        outputDirectory: installerDir,
        authors: 'Slamby',
        exe: 'slambyinsight.exe',
        title: 'Slamby Insight',
        setupIcon: iconDir,
        setupExe: setupExeName,
        iconUrl: 'https://www.slamby.com/app/icon.png',
        noMsi: true
    });

    return resultPromise.then(() => console.log(`Creating installer for ${platform} succeded!`));
    // resultPromise.then(
    //     () => console.log("Install created!"),
    //     (e) => console.log(`Error occured: ${e.message}`)
    // );
}