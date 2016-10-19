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
import { ConfirmDialogComponent } from './common/components/confirm.dialog.component';
import { ConfirmModel } from './models/confirm.model';
import { DialogResult } from './models/dialog-result';

import { OptionService } from './common/services/option.service';
import { Messenger } from './common/services/messenger.service';
import { IpcHelper } from './common/helpers/ipc.helper';

import { NotificationService } from './common/services/notification.service';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { ToastyService } from 'ng2-toasty';
import { TabsComponent } from './common/components/tabs.component';

const { ipcRenderer } = require('electron');

@Component({
    selector: 'sl-app',
    template: require('./app.component.html'),
    styles: [require('./app.component.scss')]
})
export class AppComponent implements OnInit {
    version: string = 'v0.0.0';
    pageTitle: string = 'Slamby Insight';
    cursor = "pointer";

    @ViewChild(ConfirmDialogComponent) confirmDialog: ConfirmDialogComponent;
    @ViewChild("tabs") tabs: TabsComponent;
    @ViewChild(SettingsDialogComponent) settingsDialog: SettingsDialogComponent;
    menuItems = [WelcomeComponent, DatasetsComponent, ImportComponent, ServicesComponent,
        ProcessesComponent, ResourcesComponent, NotificationComponent];
    defaultTab = WelcomeComponent;
    globals: Globals;

    constructor(private optionService: OptionService,
        private _notificationService: NotificationService,
        private slimLoadingBarService: SlimLoadingBarService,
        private toastyService: ToastyService,
        private messenger: Messenger,
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
            if (method === 'update-downloaded') {
                this.zone.run(() => this.updateInstallationQuestion(msg));
            } else {
                this.zone.run(() => this._notificationService.info(msg));
            }
        });
        this.messenger.messageAvailable$.subscribe(
            m => {
                if (m.message === 'setCursor') {
                    this.cursor = m.arg;
                }
            }
        );
    }

    addTab(menuItem: any) {
        this.cursor = "progress";
        setTimeout(() => this.tabs.addTab(menuItem));
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
        } else {
            this.checkUpdates(false);
        }
    }

    endpointSelected(endpoint: Endpoint) {
        this.optionService.currentEndpoint = endpoint;
    }

    selectedBaseUrl(): string {
        return this.optionService.currentEndpoint.ApiBaseEndpoint;
    }

    checkUpdates(noteEverything: boolean) {
        let returnObject = IpcHelper.checkForUpdates();
        if (!returnObject.isSuccessful) {
            if (!noteEverything) {
                return;
            }

            let model: ConfirmModel = {
                Header: 'Version check failed',
                Message: returnObject.msg,
                Buttons: ['ok']
            };
            this.confirmDialog.model = model;
            this.confirmDialog.open();
            return;
        }

        if (returnObject.version == null) {
            if (!noteEverything) {
                return;
            }

            let model: ConfirmModel = {
                Header: 'Version check',
                Message: `Congratulations! You already have the latest version!`,
                Buttons: ['ok']
            };
            this.confirmDialog.model = model;
        } else {
            let model: ConfirmModel = {
                Header: 'Version check',
                Message: `There is a new version: <b>${returnObject.version}</b>. Do you want to install it now?`,
                Buttons: ['yes', 'no']
            };
            this.confirmDialog.model = model;
            this.confirmDialog.dialogClosed.subscribe(
                (result: ConfirmModel) => {
                    if (result.Result === DialogResult.Yes) {
                        IpcHelper.downloadAndInstallUpdates();
                    }
                }
            );
        }
        this.confirmDialog.open();
    }

    updateInstallationQuestion(msg: string) {
        let model: ConfirmModel = {
            Header: 'Install now?',
            Message: msg,
            Buttons: ['yes', 'no']
        };
        this.confirmDialog.model = model;
        this.confirmDialog.dialogClosed.subscribe(
            (result: ConfirmModel) => {
                if (result.Result === DialogResult.Yes) {
                    IpcHelper.restartForUpdates();
                }
            }
        );
        this.confirmDialog.open();
    }

    settingsDialogOpen() {
        this.cursor = "progress";
        setTimeout(() => this.settingsDialog.open().result.then((result) => {
            this.cursor = "pointer";
        }, (reason) => { }));
    }
}
