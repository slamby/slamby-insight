import { TagListSelectorComponent } from './taglist-selector.component';
import { TagListSelectorDialogComponent } from './taglist-selector-dialog.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation';

import { DialogComponent } from './dialog.component';
import { CommonInputDialogComponent } from './common-input.dialog.component';
import { CommonOutputDialogComponent } from './common-output.dialog.component';
import { JsonEditorComponent } from './json-editor.component';
import { JsonEditorDialogComponent } from './json-editor-dialog.component';
import { ConfirmDialogComponent } from './confirm.dialog.component';
import { DocumentDetailsComponent } from '../../documents/document-details.component';
import { OverlayComponent } from './overlay.component';
import { ChangeSecretDialogComponent } from './change-secret-dialog.component';
import { ChangeLicenseDialogComponent } from './change-license-dialog.component';

import { PIPES_DECLARATIONS } from '../pipes/pipes.module';
import { DIRECTIVES_DECLARATIONS } from '../directives/directives.module';

import { VsFor } from 'ng2-vs-for/src/ng2-vs-for';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [
        DialogComponent,
        CommonInputDialogComponent,
        CommonOutputDialogComponent,
        JsonEditorComponent,
        JsonEditorDialogComponent,
        ConfirmDialogComponent,
        DocumentDetailsComponent,
        VsFor,
        PIPES_DECLARATIONS,
        DIRECTIVES_DECLARATIONS,
        OverlayComponent,
        TagListSelectorDialogComponent,
        TagListSelectorComponent,
        ChangeSecretDialogComponent,
        ChangeLicenseDialogComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        NgbModule.forRoot(),
        CustomFormsModule
    ],
    exports: [
        DialogComponent,
        CommonInputDialogComponent,
        CommonOutputDialogComponent,
        JsonEditorComponent,
        JsonEditorDialogComponent,
        ConfirmDialogComponent,
        DocumentDetailsComponent,
        VsFor,
        PIPES_DECLARATIONS,
        DIRECTIVES_DECLARATIONS,
        OverlayComponent,
        TagListSelectorDialogComponent,
        TagListSelectorComponent,
        ChangeSecretDialogComponent,
        ChangeLicenseDialogComponent
    ]
})
export class CommonComponentsModule { }
