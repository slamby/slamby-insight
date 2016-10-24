import { Globals } from './../../models/globals';
import { Endpoint } from '../../models/endpoint';

const { ipcRenderer } = require('electron');

export module IpcHelper {

    export function getSettings(): any {
        return ipcRenderer.sendSync('get-settings');
    }

    export function getEndpoints(settings?: any): Endpoint[] {

        if (!settings) {
            settings = getSettings();
        }

        return settings['endpoints'] != null ? settings['endpoints'] : [];
    }

    export function setEndpoints(endpoints: Endpoint[], settings?: any) {
        if (!settings) {
            settings = getSettings();
        }

        settings.endpoints = endpoints;

        ipcRenderer.sendSync('save-settings', settings);
    }

    export function reload(endpoint?: Endpoint) {
        ipcRenderer.send('reload', { endpoint: endpoint });
    }

    export function getGlobals(): Globals {
        return <Globals>ipcRenderer.sendSync('get-globals');
    }

    export function setGlobals(globals: Globals) {
        ipcRenderer.sendSync('set-globals', globals);
    }

    export function setGlobalsVar(key: string, value: any) {
        let globals = ipcRenderer.sendSync('get-globals');
        globals[key] = value;
        setGlobals(globals);
    }

    export function getVersions(): any {
        return ipcRenderer.sendSync('get-versions');
    }

    export function checkForUpdates(): any {
        return ipcRenderer.sendSync('check-for-updates');
    }

    export function downloadAndInstallUpdates(): any {
        ipcRenderer.send('install-updates');
    }

    export function restartForUpdates(): any {
        ipcRenderer.send('install-restart');
    }
}
