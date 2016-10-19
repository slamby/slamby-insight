import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { NotificationComponent } from './notification.component';
import { NotificationIconComponent } from './notificationicon.component';

import { NotificationService } from '../common/services/notification.service';

import { CommonComponentsModule } from '../common/components/common-components.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
    declarations: [
        NotificationComponent,
        NotificationIconComponent
    ],
    providers: [
        NotificationService
    ],
    exports: [NotificationIconComponent],
    imports: [
        NgbModule.forRoot(),
        BrowserModule,
        HttpModule,
        FormsModule,
        CommonComponentsModule
    ],
    bootstrap: [NotificationComponent],
})
export class NotificationsModule { }
