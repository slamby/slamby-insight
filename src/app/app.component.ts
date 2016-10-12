import { Component, OnInit, NgZone, ViewChild } from '@angular/core';

import { Endpoint } from './models/endpoint';
import { Globals } from './models/globals';

import { WelcomeComponent } from './home/welcome.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { ServicesComponent } from './services/services.component';
import { ProcessesComponent } from './processes/processes.component';
import { ImportComponent } from './import/import.component';
import { ResourcesComponent } from './resources/resources.component';
import { NotificationComponent } from './notifications/notification.component';
import { SettingsDialogComponent } from './settings/settings.dialog.component';

import { OptionService } from './common/services/option.service';
import { IpcHelper } from './common/helpers/ipc.helper';

import { NotificationService } from './common/services/notification.service';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { ToastyService } from 'ng2-toasty';

const { ipcRenderer } = require('electron');

@Component({
    selector: 'pm-app',
    template: require('./app.component.html'),
    styles: [require('./app.component.scss')]
})
export class AppComponent implements OnInit {
    version: string = 'v0.0.0';
    pageTitle: string = 'Slamby Insight';

    @ViewChild(SettingsDialogComponent) settingsDialog: SettingsDialogComponent;
    menuItems = [WelcomeComponent, DatasetsComponent, ImportComponent, ServicesComponent,
        ProcessesComponent, ResourcesComponent, NotificationComponent];
    defaultTab = WelcomeComponent;
    globals: Globals;

    constructor(private optionService: OptionService,
        private _notificationService: NotificationService,
        private slimLoadingBarService: SlimLoadingBarService,
        private toastyService: ToastyService,
        private zone: NgZone) {
        ipcRenderer.on('download-start', (event) => {
            this.zone.run(() => this.downloadStart());
        });
        ipcRenderer.on('download-progress', (event, item: any) => {
            this.zone.run(() => this.downloadStatusUpdate(item));
        });

        ipcRenderer.on('update-message', (event, method, msg) => {
            if (method === 'checking-for-update') {
                return;
            }

            this.zone.run(() => this._notificationService.info(msg));
        });
    }

    downloadStart() {
        this.toastyService.info('Download started');
        this.slimLoadingBarService.progress = 0;
    }

    downloadStatusUpdate(item: any) {
        if (item.state === 'interrupted') {
            this.toastyService.info('Download is interrupted but can be resumed');
        } else if (item.state === 'progressing') {
            this.slimLoadingBarService.progress = item.done;
        } else if (item.state === 'paused') {
            this.toastyService.info('Download is paused');
        } else if (item.state === 'completed') {
            this.toastyService.success('Download successfully');
            this.slimLoadingBarService.complete();
        } else {
            this.toastyService.error(`Download failed: ${item.state}`);
            this.slimLoadingBarService.complete();
        }
    }

    ngOnInit(): void {
        this.globals = IpcHelper.getGlobals();
        this.version = this.globals.version;
        if (this.globals.developmentMode) {
            this.version = `${this.version} (dev)`;
        }
    }

    endpointSelected(endpoint: Endpoint) {
        this.optionService.currentEndpoint = endpoint;
    }

    selectedBaseUrl(): string {
        return this.optionService.currentEndpoint.ApiBaseEndpoint;
    }

    checkUpdates() {
        IpcHelper.checkForUpdates();
    }

    settingsDialogOpen() {
        this.settingsDialog.open().result.then((result) => {
        }, (reason) => {
        });
    }
}
