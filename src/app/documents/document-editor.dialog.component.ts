import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../models/dialog-result';
import { Subject } from 'rxjs';
import { DocumentWrapper } from '../models/document-wrapper';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { CommonHelper } from '../common/helpers/common.helper';

@Component({
    selector: 'document-editor-dialog',
    template: require('./document-editor.dialog.component.html'),
    styles: [require('./document-editor.dialog.component.scss')]
})
export class DocumentEditorDialogComponent {
    private _modalRef: any;
    @Input() model: DocumentWrapper;
    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };

    showProgress = false;
    private dialogClosedEventSource = new Subject<DocumentWrapper>();
    dialogClosed = this.dialogClosedEventSource.asObservable();

    constructor(private modal: NgbModal) {
    }

    open() {
        this._modalRef = this.modal.open(this.template, this.modalOptions);
        this.showProgress = false;
    }

    cancel() {
        this.model.Result = DialogResult.Cancel;
        this.dialogClosedEventSource.next(this.model);
        this.unsubscribeAndClose();
    }

    ok() {
        let isParseError = false;
        try {
            JSON.parse(CommonHelper.escapeJson(this.model.Document));
        } catch (error) {
            this.model.ErrorMessage = error;
            isParseError = true;
        }
        if (!isParseError) {
            this.model.Result = DialogResult.Ok;
            this.dialogClosedEventSource.next(this.model);
        }
    }

    unsubscribeAndClose() {
        this.dialogClosedEventSource = new Subject<DocumentWrapper>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
        this._modalRef.close();
    }
}
