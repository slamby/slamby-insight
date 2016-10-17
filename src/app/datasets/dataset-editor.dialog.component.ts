import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../models/dialog-result';
import { Subject } from 'rxjs';
import { DataSetWrapper } from '../models/dataset-wrapper';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'dataset-editor-dialog',
    template: require('./dataset-editor.dialog.component.html'),
    styles: [`
            .sample-json {
                font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
                height: 300px;
                min-height: 200px;
                resize: vertical;
            }
            .progress-bar.indeterminate {
                position: relative;
                animation: progress-indeterminate 3s linear infinite;
            }

            @keyframes progress-indeterminate {
                from { left: -25%; width: 25%; }
                to { left: 100%; width: 25%;}
            }`]
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
        this.showProgress = true;
        this.model.Result = DialogResult.Ok;
        this.dialogClosedEventSource.next(this.model);
    }

    unsubscribeAndClose() {
        this.dialogClosedEventSource = new Subject<DataSetWrapper>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
        this._modalRef.close();
    }
}
