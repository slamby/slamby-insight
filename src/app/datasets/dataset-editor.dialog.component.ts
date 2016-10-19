import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../models/dialog-result';
import { Subject } from 'rxjs';
import { DataSetWrapper } from '../models/dataset-wrapper';

import { CommonHelper } from '../common/helpers/common.helper';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sl-dataset-editor-dialog',
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
    showProgress = false;
    private dialogClosedEventSource = new Subject<DataSetWrapper>();
    dialogClosed = this.dialogClosedEventSource.asObservable();

    constructor(private modal: NgbModal) {
    }

    open() {
        this.showProgress = false;
        this._modalRef = this.modal.open(this.template, this.modalOptions);
    }

    cancel() {
        this.model.Result = DialogResult.Cancel;
        this.dialogClosedEventSource.next(this.model);
        this.unsubscribeAndClose();
    }

    ok() {
        let isParseError = false;
        try {
            if (this.model.sampleDocumentChecked) {
                JSON.parse(CommonHelper.escapeJson(this.model.dataSet.SampleDocument));
            } else {
                JSON.parse(CommonHelper.escapeJson(this.model.dataSet.Schema));
            }
        } catch (error) {
            this.model.ErrorMessage = error;
            isParseError = true;
        }
        if (!isParseError) {
            this.showProgress = true;
            this.model.Result = DialogResult.Ok;
            this.dialogClosedEventSource.next(this.model);
        }
    }

    unsubscribeAndClose() {
        this.dialogClosedEventSource = new Subject<DataSetWrapper>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
        this._modalRef.close();
    }
}
