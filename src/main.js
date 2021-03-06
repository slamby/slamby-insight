const electronSquirrelStartup = require('electron-squirrel-startup');

const electron = require('electron');
//For icon loading require path
const path = require('path');
// Module to control application life.
const {app, globalShortcut, ipcMain, autoUpdater } = electron;
// Module to create native browser window.
const { BrowserWindow } = electron;

const os = require('os');

const logger = require('winston');
logger.level = 'debug';

logger.add(logger.transports.File, { filename: 'insight.log' });
global.logger = logger;

var SettingsHelper = require('./helper/settings-helper');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

//icon path for linux/windows icon loading.
var iconPath = path.join(__dirname, './assets/icons/icon.png')
var pkginfo = require('pkginfo')(module, 'version');
var globals = {
    version: "0.0.0",
    developmentMode: false,
    selectedEndpoint: null,
    latestVersion: ""
}
var isDevelopment = process.env.NODE_ENV === 'development';
var updateFeed = 'http://localhost:1337/updates/latest';
var feedURL = '';
var nutsUrl = 'https://insight.slamby.com'
var linuxPackageFilePath = '';

// Main entry point
main();

function main() {
    if (electronSquirrelStartup) {
        return;
    }

    if (handleSquirrelEvent()) {
        // squirrel event handled and app will exit in 1000ms, so don't do anything else
        return;
    }

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', startApp);

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
            startApp();
        }
    });
}

function startApp() {

    initGlobals();
    initErrorHandler();

    SettingsHelper.Init();

    registerIpcEvents();
    registerAutoUpdateEvents();

    createWindow();
}

function initGlobals() {
    globals.version = module.exports.version;
    globals.developmentMode = isDevelopment;
}

function initErrorHandler() {
    process.on('uncaughtException', (err) => {
        // error handler goes here
        console.log('whoops! there was an error');
        logger.error(err);
    });
}

function loadIndexHtml() {
    mainWindow.loadURL(`file://${__dirname}/index.html`);
}

function createWindow() {

    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 1024, height: 768, minWidth: 1024, minHeight: 768, icon: iconPath, backgroundColor: '#00B5AB', show: false, blinkFeatures: 'OverlayScrollbars', title: 'Slamby Insight' });

    mainWindow.maximize();
    loadIndexHtml();
    mainWindow.show();

    if (isDevelopment) {
        mainWindow.webContents.openDevTools();
    }
    registerGlobalShortcuts(mainWindow);

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    // hack to prevent JSON file preview
    mainWindow.webContents.on('will-navigate', function(event, url) {
        if (url.endsWith(".json")) {
            event.preventDefault();
            mainWindow.webContents.downloadURL(url);
        }
    });

    mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
        if (item.getURL().indexOf(nutsUrl) !== -1){
            //linux installer download
            var filePath = `${app.getPath("downloads")}/${item.getFilename()}`;
            item.setSavePath(filePath);
            item.once('done', (event, state) => {
                linuxPackageFilePath = item.getSavePath();
                let msg = `Version ${globals.latestVersion} is downloaded and the package installer will start automatically on Exit. Do you want to Exit now?`
                mainWindow.webContents.send('update-message', 'update-downloaded', msg);
            });
        } else {
            mainWindow.webContents.send('download-start');
            item.once('done', (event, state) => {
                mainWindow.webContents.send('download-progress', {
                    done: 100,
                    state: state
                });
            });
        }
        item.on('updated', (event, state) => {
                mainWindow.webContents.send('download-progress', {
                    done: Math.floor((item.getReceivedBytes() / item.getTotalBytes()) * 100),
                    state: item.isPaused() ? "paused" : state
                });
            });
    });
}

function registerGlobalShortcuts(mainWindow) {
    // let ret = globalShortcut.register('F5', () => {
    //     loadIndexHtml();
    // });
    let ret = globalShortcut.register('CommandOrControl+Shift+J', () => {
        mainWindow.webContents.toggleDevTools();
    });
}

function registerIpcEvents() {
    ipcMain.on('reload', (event, arg) => {
        globals.selectedEndpoint = arg.endpoint ? arg.endpoint : null;

        loadIndexHtml();
    });

    ipcMain.on('get-globals', (event, arg) => {
        event.returnValue = globals;
    });
    ipcMain.on('set-globals', (event, arg) => {
        globals = arg;
    });
    ipcMain.on('get-versions', (event, arg) => {
        event.returnValue = process.versions;
    });
    ipcMain.on('check-for-updates', (event, arg) => {
        if (isDevelopment) {
            event.returnValue = 'Cannot check updates due to Development mode';
            return;
        }
        try {
            var latestVersionDetailsUrl = `${nutsUrl}/api/version/latest`;
            var returnObject = {
                isSuccessful : true,
                version : null,
                msg : ""
            };

            var request = require('request');
            request({url: latestVersionDetailsUrl, json: true}, function(err, res, versionJson) {
                if (err) {
                    logger.error(err);
                    returnObject.isSuccessful = false;
                    returnObject.msg = 'Get latest version information failed';
                    event.returnValue = returnObject;
                    return;
                }
                returnObject.msg = 'Get latest version information succeed';
                returnObject.version = globals.version == versionJson.tag ? null : versionJson.tag 
                event.returnValue = returnObject;
                globals.latestVersion = versionJson.tag;
            });
        } catch (e) {
            returnObject.isSuccessful = false;
            returnObject.msg = 'Get latest version information failed';
            logger.error(e);
            event.returnValue = returnObject;
        }
    });

    ipcMain.on('install-updates', (event, arg) => {
        var versionToSend = os.platform() != "darwin" ? globals.latestVersion : globals.version; 
        feedURL = `${nutsUrl}/update/${os.platform()}_${os.arch()}/${versionToSend}`;
        logger.debug(`set autoupdater url to: ${feedURL}`);
        
        if (os.platform() == "linux"){
            var downloadURL = `${nutsUrl}/download/version/${globals.latestVersion}/${os.platform()}_${os.arch()}`;
            mainWindow.webContents.downloadURL(downloadURL);
        } else {
            autoUpdater.setFeedURL(feedURL);
            autoUpdater.checkForUpdates();
        }
        
    });

    ipcMain.on('install-restart', (event, arg) => {
        if (os.platform() == "linux"){
            const exec = require('child_process').exec;
            const child = exec(`xdg-open ${linuxPackageFilePath}`, (error, stdout, stderr) => {
                if (error) { logger.error(error); }
            });
            app.quit();
        } else {
            autoUpdater.quitAndInstall();
        }
    });
}

function registerAutoUpdateEvents() {
    if (isDevelopment) {
        return;
    }

    autoUpdater.addListener("update-available", function (event) {
        let msg = "Downloading update in the background";
        logger.debug(msg);
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-available', msg);
        }
    });
    autoUpdater.addListener("update-downloaded", function (event, releaseNotes, releaseName, releaseDate, updateURL) {
        let msg = `Version ${releaseName} is downloaded and will be automatically installed on Exit. Do you want to relaunch the application now?`;
        logger.debug("A new update is ready to install", msg);
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-downloaded', msg);
        }
    });
    autoUpdater.addListener("error", function (error) {
        logger.error(error);
        let msg = `There was an error during the update process`;
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-error', msg);
        }
    });
    autoUpdater.addListener("checking-for-update", function (event) {
        let msg = "Checking for update";
        logger.debug(msg);
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'checking-for-update', msg);
        }
    });
    autoUpdater.addListener("update-not-available", function () {
        let msg = "Update not available";
        logger.debug(msg);
        if (mainWindow) {
            mainWindow.webContents.send('update-message', 'update-not-available', msg);
        }
    });
}

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function (command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
        } catch (error) { }

        return spawnedProcess;
    };

    const spawnUpdate = function (args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            app.quit();
            return true;
    }
};