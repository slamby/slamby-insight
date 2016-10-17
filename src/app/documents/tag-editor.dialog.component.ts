import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../models/dialog-result';
import { Subject } from 'rxjs';
import { TagWrapper } from '../models/tag-wrapper';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'tag-editor-dialog',
    template: require('./tag-editor.dialog.component.html'),
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
export class TagEditorDialogComponent {
    private _modalRef: any;
    @Input() model: TagWrapper;
    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };
    private dialogClosedEventSource = new Subject<TagWrapper>();
    dialogClosed = this.dialogClosedEventSource.asObservable();
    showProgress = false;

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
        this.showProgress = true;
        this.model.Result = DialogResult.Ok;
        this.dialogClosedEventSource.next(this.model);
    }

    unsubscribeAndClose() {
        this.dialogClosedEventSource = new Subject<TagWrapper>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
        this._modalRef.close();
    }
}
