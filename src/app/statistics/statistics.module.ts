import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { StatisticsComponent } from './statistics.component';

import { StatisticsService } from '../common/services/statistics.service';
import { NotificationService } from '../common/services/notification.service';

import { MaterialModule } from '@angular/material';


@NgModule({
    declarations: [
        StatisticsComponent
    ],
    providers: [
        StatisticsService,
        NotificationService
    ],
    imports: [
        MaterialModule.forRoot(),
        BrowserModule,
        HttpModule,
        FormsModule
    ],
    bootstrap: [StatisticsComponent],
})
export class StatisticsModule { }
