import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { DialogComponent } from './dialog.component';
import { CommonInputDialogComponent } from './common-input.dialog.component';
import { CommonOutputDialogComponent } from './common-output.dialog.component';
import { JsonEditorComponent } from './json-editor.component';
import { ConfirmDialogComponent } from './confirm.dialog.component';
import { DocumentDetailsComponent } from '../../documents/document-details.component';
import { OverlayComponent } from './overlay.component';

import { PIPES_DECLARATIONS } from '../pipes/pipes.module';

import { VsFor } from 'ng2-vs-for/src/ng2-vs-for';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [
        DialogComponent,
        CommonInputDialogComponent,
        CommonOutputDialogComponent,
        JsonEditorComponent,
        ConfirmDialogComponent,
        DocumentDetailsComponent,
        VsFor,
        PIPES_DECLARATIONS,
        OverlayComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        NgbModule.forRoot()
    ],
    exports: [
        DialogComponent,
        CommonInputDialogComponent,
        CommonOutputDialogComponent,
        JsonEditorComponent,
        ConfirmDialogComponent,
        DocumentDetailsComponent,
        VsFor,
        PIPES_DECLARATIONS,
        OverlayComponent
    ],
    bootstrap: [
        DialogComponent,
        CommonInputDialogComponent,
        CommonOutputDialogComponent,
        JsonEditorComponent,
        ConfirmDialogComponent,
        OverlayComponent
    ]
})
export class CommonComponentsModule { }
