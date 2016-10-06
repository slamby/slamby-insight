import { Injectable } from '@angular/core';

import { Notification } from '../../models/notification';

import * as _ from 'lodash';

@Injectable()
export class NotificationService {

    private notifications: Array<ReadNotification> = [];

    constructor() { }

    private add(type: 'error' | 'info' | 'success' | 'warning' | 'custom', message: string, title?: string) {
        let notification: ReadNotification = {
            type: type,
            message: message,
            title: title,
            timestamp: Date.now(),
            read: false
        };
        // adds item to the beggining of the array
        this.notifications.unshift(notification);
    }

    error(message: string, title?: string) {
        this.add('error', message, title);
    }

    info(message: string, title?: string) {
        this.add('info', message, title);
    }

    success(message: string, title?: string) {
        this.add('success', message, title);
    }

    warning(message: string, title?: string) {
        this.add('warning', message, title);
    }

    unreadNotifications(): ReadNotification[] {
        return _.filter(this.notifications, ['read', false]);
    }

    getLatest(count = 10): ReadNotification[] {
        return _.take(this.notifications, count);
    }

    count(): number {
        return this.notifications.length;
    }

    unreadCount(): number {
        return this.unreadNotifications().length;
    }

    getPage(pageSize: number, page: number): ReadNotification[] {
        return _.slice(this.notifications, pageSize * page, (pageSize * page) + pageSize);
    }

    markAsRead() {
        _.filter(this.notifications, ['read', false])
            .forEach((item: ReadNotification) => item.read = true);
    }
}

export class ReadNotification extends Notification {
    read: boolean;
}
