import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { ProcessesComponent } from './processes.component';

import { ProcessesService } from '../common/services/processes.service';
import { Messenger } from '../common/services/messenger.service';
import { NotificationService } from '../common/services/notification.service';

import { MaterialModule } from '@angular/material';
import { CommonComponentsModule } from '../common/components/common-components.module';


@NgModule({
    declarations: [
        ProcessesComponent
    ],
    providers: [
        ProcessesService,
        NotificationService,
        Messenger
    ],
    imports: [
        CommonComponentsModule,
        MaterialModule.forRoot(),
        BrowserModule,
        HttpModule,
        FormsModule
    ],
    bootstrap: [ProcessesComponent],
})
export class ProcessesModule { }
