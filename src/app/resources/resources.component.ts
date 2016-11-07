import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';

import { StatusService } from '../common/services/status.service';
import { IStatus } from 'slamby-sdk-angular2';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';

@Component({
    template: require('./resources.component.html')
})

export class ResourcesComponent implements OnInit {
    static pageTitle: string = 'Resources';
    static pageIcon: string = 'fa-heartbeat';
    errorMessage: string;
    statusObj: IStatus = {};
    lastUpdateTimeString: string;

    refreshInterval = 5;
    timer = Observable.timer(0, this.refreshInterval * 1000);

    private subscribe: ISubscription;

    constructor(public _statusService: StatusService, private _notificationService: NotificationService) {
    }

    ngOnInit(): void {
        this.subscribe = this.timer.subscribe(t => {
            this.getStatus();
        });
    }

    save(refreshInterval: number) {
        this.refreshInterval = refreshInterval;
        this.subscribe.unsubscribe();
        this.timer = Observable.timer(0, this.refreshInterval * 1000);
        this.subscribe = this.timer.subscribe(t => {
            this.getStatus();
        });
    }

    private getStatus() {
        this._statusService.getStatus()
            .finally(() => this.lastUpdateTimeString = new Date().toLocaleTimeString())
            .subscribe(
            status => {
                this.errorMessage = '';
                this.statusObj = status;
            },
            error => this.handleError(error));
    }

    handleError(response: Response) {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this.errorMessage = errors;
    }
}
