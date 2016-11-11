import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { ImportComponent } from './import.component';

import { DatasetService } from '../common/services/dataset.service';
import { TagService } from '../common/services/tag.service';
import { DocumentService } from '../common/services/document.service';
import { NotificationService } from '../common/services/notification.service';
import { OptionService } from '../common/services/option.service';

import { MaterialModule } from '@angular/material';
import { CommonComponentsModule } from '../common/components/common-components.module';


@NgModule({
    declarations: [
        ImportComponent
    ],
    providers: [
        DatasetService,
        DocumentService,
        TagService,
        NotificationService,
        OptionService
    ],
    imports: [
        CommonComponentsModule,
        MaterialModule.forRoot(),
        BrowserModule,
        HttpModule,
        FormsModule
    ],
    bootstrap: [ImportComponent],
})
export class ImportModule { }
