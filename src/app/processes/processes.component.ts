import { Component, OnInit, ViewChild } from '@angular/core';
import { Response } from '@angular/http';

import { IProcess } from 'slamby-sdk-angular2';
import { ProcessesService } from '../common/services/processes.service';

import { Messenger } from '../common/services/messenger.service';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';
import { Observable, Subscription } from 'rxjs';

import { CommonOutputDialogComponent } from '../common/components/common-output.dialog.component';
import { CommonOutputModel } from '../models/common-output.model';

import * as _ from 'lodash';


@Component({
    template: require('./processes.component.html')
})
export class ProcessesComponent implements OnInit {
    static pageTitle: string = 'Processes';
    static pageIcon: string = 'fa-spinner';

    @ViewChild(CommonOutputDialogComponent) detailsDialog: CommonOutputDialogComponent;

    loadAll = false;
    processStatus = IProcess.IStatusEnum;
    processes: Array<IProcess> = [];

    activeProcesses: Array<IProcess> = [];

    refreshInterval = 5;

    timer = Observable.timer(0, this.refreshInterval * 1000);
    private subscribe: Subscription;

    constructor(private _processesService: ProcessesService,
        private _notificationService: NotificationService,
        private _messenger: Messenger) {
    }

    ngOnInit(): void {
        this._messenger.messageAvailable$.subscribe(m => {
            if (m.message === 'newProcessCreated') {
                if (m.arg) {
                    this.refresh(<IProcess>m.arg);
                } else {
                    this.refresh();
                }
            }
        });
        this.subscribe = this.timer.subscribe(t => {
            this.activeProcesses.forEach(p => this.refresh(p));
        });
        this.refresh();
    }

    refresh(selected?: IProcess) {
        if (selected) {
            this._processesService.getProcess(selected.Id).subscribe(
                (process: IProcess) => {
                    // update process list
                    let index = this.processes.findIndex(p => p.Id === process.Id);
                    if (index < 0) {
                        this.processes = _.concat(this.processes, [process]);
                        this.processes = _.orderBy(this.processes, p => p.Start, ['desc']);
                    } else {
                        this.processes[index] = process;
                    }

                    // update active list
                    index = this.activeProcesses.findIndex(p => p.Id === process.Id);
                    if (process.Status === IProcess.IStatusEnum.InProgress) {
                        if (index < 0) {
                            this.activeProcesses = _.concat(this.activeProcesses, [process]);
                            this.activeProcesses = _.orderBy(this.activeProcesses, p => p.Start, ['desc']);
                        } else {
                            this.activeProcesses[index] = process;
                        }
                    } else {
                        if (index >= 0) {
                            this._notificationService.info(process.ResultMessage, 'Process finished');
                            this.activeProcesses.splice(index, 1);
                        }
                    }
                },
                error => this.handleError(error)
            );
        } else {
            this._processesService.getProcesses(this.loadAll).subscribe(
                (processes: Array<IProcess>) => {
                    this.processes = _.orderBy(processes, p => p.Start, ['desc']);
                    this.activeProcesses = this.processes.filter(p => p.Status === IProcess.IStatusEnum.InProgress);
                },
                error => this.handleError(error)
            );
        }
    }

    checkAll() {
        this.loadAll = !this.loadAll;
        this.refresh();
    }

    cancel(selected: IProcess) {
        if (!selected) {
            return;
        }
        this._processesService.cancel(selected.Id).subscribe(
            error => this.handleError(error),
            () => this.refresh(selected)
        );
    }

    details(selected: IProcess) {
        if (!selected) {
            return;
        }
        let detailsObject = {};
        Object.keys(selected).forEach(prop => {
            detailsObject[prop] = JSON.stringify(selected[prop], null, 4);
        });
        let model: CommonOutputModel = {
            Header: 'Process details',
            OutputObject: detailsObject
        };
        this.detailsDialog.model = model;
        this.detailsDialog.open();
    }

    handleError(response: Response) {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `DataSet error (${response.status})`);
    }
}
