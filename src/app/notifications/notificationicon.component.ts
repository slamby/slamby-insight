import { Component } from '@angular/core';
import { NotificationService, ReadNotification } from '../common/services/notification.service';

@Component({
    selector: 'sl-notification-icon',
    template: require('./notificationicon.component.html'),
    styles: [require('./notificationicon.component.scss')]
})
export class NotificationIconComponent {
    constructor(private _notificationService: NotificationService) {
    }

    displayNotifications(): Array<ReadNotification> {
        return this._notificationService.getLatest(100);
    }

    unreadCount(): number {
        return this._notificationService.unreadCount();
    }

    count(): number {
        return this._notificationService.count();
    }

    openChange(open: boolean) {
        this._notificationService.markAsRead();
    }
}
