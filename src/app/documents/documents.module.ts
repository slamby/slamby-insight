import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { DocumentsComponent } from './documents.component';
import { DocumentEditorDialogComponent } from './document-editor.dialog.component';
import { TagEditorDialogComponent } from './tag-editor.dialog.component';
import { DocumentDetailsDialogComponent } from './document-details.dialog.component';
import { DatasetSelectorDialogComponent } from '../datasets/dataset-selector.dialog.component';
import { TagSelectorDialogComponent } from './tag-selector.dialog.component';
import { TagListSelectorComponent } from './taglist-selector.component';
import { TagListSelectorDialogComponent } from './taglist-selector-dialog.component';

import { DocumentService } from '../common/services/document.service';
import { TagService } from '../common/services/tag.service';
import { DatasetService } from '../common/services/dataset.service';
import { Messenger } from '../common/services/messenger.service';
import { NotificationService } from '../common/services/notification.service';

import { MaterialModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentsModule } from '../common/components/common-components.module';


@NgModule({
    declarations: [
        DocumentsComponent,
        DocumentEditorDialogComponent,
        TagEditorDialogComponent,
        DocumentDetailsDialogComponent,
        DatasetSelectorDialogComponent,
        TagEditorDialogComponent,
        TagListSelectorComponent,
        TagSelectorDialogComponent,
        TagListSelectorDialogComponent
    ],
    providers: [
        DocumentService,
        TagService,
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
    bootstrap: [DocumentsComponent],
})
export class DocumentsModule { }
