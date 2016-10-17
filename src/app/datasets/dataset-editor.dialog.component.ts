import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../models/dialog-result';
import { Subject } from 'rxjs';
import { DataSetWrapper } from '../models/dataset-wrapper';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'dataset-editor-dialog',
    template: require('./dataset-editor.dialog.component.html'),
    styles: [require('./dataset-editor.dialog.component.scss')]
})
export class DatasetEditorDialogComponent {
    private _modalRef: any;
    @Input() model: DataSetWrapper;
    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };
    private dialogClosedEventSource = new Subject<DataSetWrapper>();
    dialogClosed = this.dialogClosedEventSource.asObservable();

    constructor(private modal: NgbModal) {
    }

    open() {
        this._modalRef = this.modal.open(this.template, this.modalOptions);
    }

    cancel() {
        this.model.Result = DialogResult.Cancel;
        this.dialogClosedEventSource.next(this.model);
        this.dialogClosedEventSource = new Subject<DataSetWrapper>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
    }

    ok() {
        this.model.Result = DialogResult.Ok;
        this.dialogClosedEventSource.next(this.model);
        this.dialogClosedEventSource = new Subject<DataSetWrapper>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
        this._modalRef.close();
    }
}
