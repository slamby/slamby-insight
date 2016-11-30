import { Component, OnInit, NgZone, ViewChild, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { Http } from '@angular/http';

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

import { IpcHelper } from './common/helpers/ipc.helper';

import { OptionService, Messenger, LicenseService, NotificationService, UpdaterService, UpdaterResult } from './common/services/services.module';

import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { ToastyService } from 'ng2-toasty';
import { TabsComponent } from './common/components/tabs.component';

import { ToastsManager, ToastOptions } from 'ng2-toastr/ng2-toastr';

import { ILicense } from 'slamby-sdk-angular2';

const { ipcRenderer } = require('electron');

@Component({
    selector: 'sl-app',
    template: require('./app.component.html'),
    styles: [require('./app.component.scss')]
})
export class AppComponent implements OnInit {
    version: string = 'v0.0.0';
    pageTitle: string = 'Slamby Insight';
    cursor = 'pointer';

    @ViewChild(ConfirmDialogComponent) confirmDialog: ConfirmDialogComponent;
    @ViewChild('tabs') tabs: TabsComponent;
    @ViewChild(SettingsDialogComponent) settingsDialog: SettingsDialogComponent;
    menuItems = [WelcomeComponent, DatasetsComponent, ImportComponent, ServicesComponent,
        ProcessesComponent, ResourcesComponent, NotificationComponent];
    defaultTab = WelcomeComponent;
    globals: Globals;

    constructor(private optionService: OptionService,
        private notificationService: NotificationService,
        private slimLoadingBarService: SlimLoadingBarService,
        private toastyService: ToastyService,
        private messenger: Messenger,
        private zone: NgZone,
        private cd: ChangeDetectorRef,
        private licenseService: LicenseService,
        private toastr: ToastsManager,
        private updaterService: UpdaterService,
        viewContainerRef: ViewContainerRef) {

        this.toastr.setRootViewContainerRef(viewContainerRef);

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
                this.zone.run(() => this.notificationService.info(msg));
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
        this.cursor = 'progress';
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
        this.cd.detectChanges();
    }

    endpointSelected(endpoint: Endpoint) {
        this.optionService.currentEndpoint = endpoint;
        this.optionService.updateVersion = '';
        this.optionService.updatable = false;
        this.licenseService.setEndpoint(endpoint);

        this.updaterService.checkNewerVersion()
            .then((result: UpdaterResult) => {
                // newer version found
                if (result.updateVersion) {
                    this.optionService.updateVersion = result.updateVersion;
                    this.optionService.updatable = result.updatable;

                    let title = 'New API update available';
                    let text = `Available API version is v${result.updateVersion}.`;
                    
                    // has /update endpoint
                    if (result.updatable) {
                        text = `${text} To update your server open your server settings and select update.`;
                    }
                    
                    this.notificationService.info(text, title);
                    this.toastr.info(`${text}`, title,
                        <ToastOptions>{
                            enableHTML: true,
                            showCloseButton: false,
                            dismiss: 'auto',
                            toastLife: 5000
                        }
                    );
                }
            })
            .catch((reason) => {
                // could not get update information
                let title = 'API Update';
                this.notificationService.error(reason, title);
            });

        this.licenseService.getLicense()
            .subscribe(
            (license: ILicense) => {
                if (license.Type === 'OpenSource') {
                    let title = 'No commercial license';
                    let text = `This Slamby API is activated under a free license for test purpose and opensourced projects. 
                        For commercial license, please purchase a commercial license. 
                        <b><a href="mailto:sales@slamby.com">sales@slamby.com</a></b>`;
                    this.notificationService.warning(text, title);
                    this.toastr.warning(`${text}`, title,
                        <ToastOptions>{
                            enableHTML: true,
                            showCloseButton: true,
                            dismiss: 'controlled'
                        }
                    );
                } else if (license.IsValid === false) {
                    let title = 'Your license is expired';
                    let text = `You have no valid license.
                        Your license has expired on this instance. Please request a valid license from our sales center. 
                        When you have a new license, you can manage it under the settings menu.`;
                    this.notificationService.error(text, title);
                    this.toastr.error(text, title,
                        <ToastOptions>{
                            enableHTML: true,
                            showCloseButton: true,
                            dismiss: 'controlled'
                        }
                    );
                }
            },
            (error) => {
                if (error.status === 404) {
                    // API server version prior 1.2.0
                }
            });
    }

    get selectedBaseUrl(): string {
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
        this.cursor = 'progress';
        setTimeout(() => this.settingsDialog.open().result.then((result) => {
            this.cursor = 'pointer';
        }, (reason) => { }));
    }
}
