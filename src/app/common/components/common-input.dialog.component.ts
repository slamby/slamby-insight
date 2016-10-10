import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../../models/dialog-result';
import { CommonInputModel } from '../../models/common-input.model';
import { Subject } from 'rxjs';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'input-dialog',
    template: require('./common-input.dialog.component.html'),
    styles: [require('./common-input.dialog.component.scss')]
})
export class CommonInputDialogComponent {
    private _json: string;
    private _type: any;
    @Input() model: CommonInputModel;
    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };
    private dialogClosedEventSource = new Subject<CommonInputModel>();
    dialogClosed = this.dialogClosedEventSource.asObservable();

    constructor(private modal: NgbModal) {
    }

    open() {
        this._json = JSON.stringify(this.model.Model, null, 4);
        this._type = typeof this.model.Model;
        this.modal.open(this.template, this.modalOptions);
    }

    cancel() {
        this.model.Result = DialogResult.Cancel;
        this.dialogClosedEventSource.next(this.model);
        this.dialogClosedEventSource = new Subject<CommonInputModel>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
    }

    ok() {
        try {
            this.model.Model = JSON.parse(this._json);
            // if (typeof this.model.Model != this.model.Type)
            //     throw "Invalid Type";
        } catch (error) {
            this.model.ErrorMessage = error;
        }
        if (!this.model.ErrorMessage) {
            this.model.Result = DialogResult.Ok;
            this.dialogClosedEventSource.next(this.model);
            this.dialogClosedEventSource = new Subject<CommonInputModel>();
            this.dialogClosed = this.dialogClosedEventSource.asObservable();
        }
    }

    getRowNumber(text: string) {
        let numberOfLineBreaks = (text.match(/\n/g) || []).length;
        return numberOfLineBreaks + 1;
    }
}
