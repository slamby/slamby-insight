import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../../models/dialog-result';
import { ConfirmModel } from '../../models/confirm.model';
import { Subject } from 'rxjs';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sl-confirm-dialog',
    template: require('./confirm.dialog.component.html'),
    styles: []
})
export class ConfirmDialogComponent {
    okButtonIsVisibile = false;
    cancelButtonIsVisibile = false;
    yesButtonIsVisibile = false;
    noButtonIsVisibile = false;
    showProgress = false;
    private modalRef;
    private _model;
    @Input() set model(model: ConfirmModel) {
        this._model = model;
        this.okButtonIsVisibile = model.Buttons.indexOf('ok') > -1;
        this.cancelButtonIsVisibile = model.Buttons.indexOf('cancel') > -1;
        this.yesButtonIsVisibile = model.Buttons.indexOf('yes') > -1;
        this.noButtonIsVisibile = model.Buttons.indexOf('no') > -1;
    }
    get model() {
        return this._model;
    }

    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: true,
        keyboard: true,
        size: 'lg',
        windowClass: ''
    };
    private dialogClosedEventSource = new Subject<ConfirmModel>();
    dialogClosed = this.dialogClosedEventSource.asObservable();

    constructor(private modal: NgbModal) {
    }

    open() {
        this.showProgress = false;
        this.modalRef = this.modal.open(this.template, this.modalOptions);
    }

    close(result: string) {
        this.showProgress = true;
        switch (result) {
            case 'ok':
                this.model.Result = DialogResult.Ok;
                break;
            case 'yes':
                this.model.Result = DialogResult.Yes;
                break;
            case 'no':
                this.model.Result = DialogResult.No;
                break;
            case 'cancel':
                this.model.Result = DialogResult.Cancel;
                break;
            default:
                break;
        }
        this.dialogClosedEventSource.next(this.model);
        if (!this.model.StayOpen) {
            this.unsubscribeAndClose();
        }
    }

    unsubscribeAndClose() {
        this.dialogClosedEventSource = new Subject<ConfirmModel>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
        this.modalRef.close();
    }
}
