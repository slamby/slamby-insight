import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { ResourcesComponent } from './resources.component';

import { StatusService } from '../common/services/status.service';
import { NotificationService } from '../common/services/notification.service';

import { MaterialModule } from '@angular/material';


@NgModule({
    declarations: [
        ResourcesComponent
    ],
    providers: [
        StatusService,
        NotificationService
    ],
    imports: [
        MaterialModule.forRoot(),
        BrowserModule,
        HttpModule,
        FormsModule
    ],
    bootstrap: [ResourcesComponent],
})
export class ResourcesModule { }
