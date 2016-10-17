import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../../models/dialog-result';
import { CommonInputModel } from '../../models/common-input.model';
import { Subject } from 'rxjs';
import { CommonHelper } from '../helpers/common.helper';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

@Component({
    selector: 'input-dialog',
    template: require('./common-input.dialog.component.html'),
    styles: [require('./common-input.dialog.component.scss')]
})
export class CommonInputDialogComponent {
    cols = 120;
    private _json: string;
    private _type: any;
    private _modalRef: any;
    @Input() model: CommonInputModel;
    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };
    private dialogClosedEventSource = new Subject<CommonInputModel>();
    dialogClosed = this.dialogClosedEventSource.asObservable();
    showProgress = false;

    constructor(private modal: NgbModal) {
    }

    open() {
        this._json = JSON.stringify(this.model.Model, null, 4);
        this._type = typeof this.model.Model;
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
            this.model.Model = JSON.parse(CommonHelper.escapeJson(this._json));
            // if (typeof this.model.Model != this.model.Type)
            //     throw "Invalid Type";
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

    getRowNumber(text: string) {
        let splittedText = _.split(text, /\n/g);
        let numberOfLineBreaks = splittedText.length;
        splittedText.forEach(l => {
            numberOfLineBreaks += _.floor((l.length / this.cols));
        });
        return numberOfLineBreaks + 1;
    }

    unsubscribeAndClose() {
        this.dialogClosedEventSource = new Subject<CommonInputModel>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
        this._modalRef.close();
    }
}
