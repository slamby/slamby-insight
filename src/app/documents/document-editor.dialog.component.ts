import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../models/dialog-result';
import { Subject } from 'rxjs';
import { DocumentWrapper } from '../models/document-wrapper';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

@Component({
    selector: 'document-editor-dialog',
    template: require('./document-editor.dialog.component.html'),
    styles: [`
    .sample-json {
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
    height: 300px;
    min-height: 200px;
    resize: vertical;
}`]
})
export class DocumentEditorDialogComponent {
    private _modalRef: any;
    cols = 120;
    @Input() model: DocumentWrapper;
    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };
    private dialogClosedEventSource = new Subject<DocumentWrapper>();
    dialogClosed = this.dialogClosedEventSource.asObservable();

    constructor(private modal: NgbModal) {
    }

    open() {
        this._modalRef = this.modal.open(this.template, this.modalOptions);
    }

    cancel() {
        this.model.Result = DialogResult.Cancel;
        this.dialogClosedEventSource.next(this.model);
        this.dialogClosedEventSource = new Subject<DocumentWrapper>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
    }

    ok() {
        this.model.Result = DialogResult.Ok;
        this.dialogClosedEventSource.next(this.model);
        this.dialogClosedEventSource = new Subject<DocumentWrapper>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
        this._modalRef.close();
    }

    getRowNumber(text: string) {
        var splittedText = _.split(text, /\n/g);
        let numberOfLineBreaks = splittedText.length;
        splittedText.forEach(l => {
            numberOfLineBreaks += _.floor((l.length / this.cols));
        });
        return numberOfLineBreaks + 1;
    }
}
