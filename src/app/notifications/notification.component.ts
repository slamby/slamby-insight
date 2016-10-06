import { Component, OnInit } from '@angular/core';
import { NotificationService, ReadNotification } from '../common/services/notification.service';

import * as _ from 'lodash';

@Component({
    template: require('./notification.component.html'),
    styles: [require('./notification.component.scss')]
})
export class NotificationComponent implements OnInit {
    static pageTitle: string = 'Notifications';
    static pageIcon: string = 'fa-bell';
    pageSize: number = 20;
    page: number = 1;

    constructor(private _notificationService: NotificationService) {
    }

    ngOnInit() {
        // this._notificationService.markAsRead();
    }

    displayNotifications(): Array<ReadNotification> {
        let latest = this._notificationService.getLatest(100);
        return _.orderBy(latest, ['timestamp'], ['desc']);
    }

    count(): number {
        return this._notificationService.count();
    }

    getCurrentPage(): ReadNotification[] {
        return this._notificationService.getPage(this.pageSize, this.page - 1);
    }
}
