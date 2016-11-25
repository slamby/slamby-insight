import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation';

import { ServicesComponent } from './services.component';

import { ServicesService } from '../common/services/services.service';
import { Messenger } from '../common/services/messenger.service';
import { NotificationService } from '../common/services/notification.service';
import { ClassifierServicesService } from '../common/services/classifier.services.service';
import { PrcServicesService } from '../common/services/prc.services.service';
import { ProcessesService } from '../common/services/processes.service';

import { MaterialModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentsModule } from '../common/components/common-components.module';

import { ServiceMaintenanceDialogComponent } from './service-maintenance.dialog.component';
import { NGramSelectorComponent } from '../common/components/ngram-selector.component';


@NgModule({
    declarations: [
        ServicesComponent,
        ServiceMaintenanceDialogComponent,
        NGramSelectorComponent
    ],
    providers: [
        ServicesService,
        Messenger,
        NotificationService,
        ClassifierServicesService,
        PrcServicesService,
        ProcessesService
    ],
    imports: [
        CommonComponentsModule,
        MaterialModule.forRoot(),
        NgbModule.forRoot(),
        BrowserModule,
        HttpModule,
        FormsModule,
        CustomFormsModule
    ],
    bootstrap: [ServicesComponent],
})
export class ServicesModule { }
