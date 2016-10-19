import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { DatasetsComponent } from './datasets.component';

import { DatasetEditorDialogComponent } from './dataset-editor.dialog.component';

import { DatasetService } from '../common/services/dataset.service';
import { Messenger } from '../common/services/messenger.service';
import { NotificationService } from '../common/services/notification.service';

import { MaterialModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentsModule } from '../common/components/common-components.module';


@NgModule({
    declarations: [
        DatasetsComponent,
        DatasetEditorDialogComponent
    ],
    providers: [
        DatasetService,
        Messenger,
        NotificationService
    ],
    imports: [
        CommonComponentsModule,
        MaterialModule.forRoot(),
        NgbModule.forRoot(),
        BrowserModule,
        HttpModule,
        FormsModule
    ],
    bootstrap: [DatasetsComponent],
})
export class DatasetsModule { }
