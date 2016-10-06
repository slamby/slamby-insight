const { app, ipcMain } = require('electron');
const settings = require('electron-settings');

let cachedSettings;
settings.configure({
    settingsDir: app.getPath('appData') + '/slambyinsight',
    settingsFileName: "settings.json",
    prettify: true
});
settings.defaults({
        endpoints: [
            {
                "Id": "855bceab-c8a6-48dd-9f31-4b035b3cb4b1",
                "BulkSize": "1000",
                "ApiBaseEndpoint": "https://europe.slamby.com/demo",
                "ApiSecret": "s3cr3t",
                "Timeout": "00:05:00",
                "ParallelLimit": "0"
            }
        ]
    });

ipcMain.on('get-settings', (event, arg) => {
    event.returnValue = arg ? cachedSettings[arg] : cachedSettings;
});

ipcMain.on('save-settings', (event, arg) => {
    if (arg) {
        for (let key in arg) {
            settings.setSync(key, arg[key]);
            cachedSettings[key] = arg[key];
        }
        event.returnValue = true;
    }
    else {
        event.returnValue = false;
    }
});

module.exports = {
    Init: function () {
        cachedSettings = settings.getSync();
    }
};