import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { DocumentsComponent } from './documents.component';
import { DocDropdownCellComponent } from './doc-dropdown-cell.component';
import { DocumentEditorDialogComponent } from './document-editor.dialog.component';
import { TagEditorDialogComponent } from './tag-editor.dialog.component';
import { DocumentDetailsDialogComponent } from './document-details.dialog.component';
import { DatasetSelectorDialogComponent } from '../datasets/dataset-selector.dialog.component';
import { TagListSelectorComponent } from './taglist-selector.component';
import { TagListSelectorDialogComponent } from './taglist-selector-dialog.component';
import { TabPaneComponent } from './tab-pane.component';

import { DocumentService } from '../common/services/document.service';
import { TagService } from '../common/services/tag.service';
import { DatasetService } from '../common/services/dataset.service';
import { Messenger } from '../common/services/messenger.service';
import { NotificationService } from '../common/services/notification.service';

import { MaterialModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentsModule } from '../common/components/common-components.module';
import { CustomFormsModule } from 'ng2-validation';
import { AgGridModule } from 'ag-grid-ng2/main';


@NgModule({
    declarations: [
        DocumentsComponent,
        DocDropdownCellComponent,
        DocumentEditorDialogComponent,
        TagEditorDialogComponent,
        DocumentDetailsDialogComponent,
        DatasetSelectorDialogComponent,
        TagEditorDialogComponent,
        TagListSelectorComponent,
        TagListSelectorDialogComponent,
        TabPaneComponent
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
        FormsModule,
        CustomFormsModule,
        AgGridModule.withNg2ComponentSupport()
    ]
})
export class DocumentsModule { }
