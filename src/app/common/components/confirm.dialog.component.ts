import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../../models/dialog-result';
import { ConfirmModel } from '../../models/confirm.model';
import { Subject } from 'rxjs';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'confirm-dialog',
    template: `
        <template #template let-c="close" let-d="dismiss">
            <div class="modal-header">
                <button type="button" class="close" aria-label="Close" (click)='close("cancel")'>
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title">{{model.Header}}</h4>
            </div>
            <p class="lead">{{model.Message}}</p>
            <div class="modal-footer">
                <div class="btn-group">
                    <button class="btn btn-primary" *ngIf='yesButtonIsVisibile' (click)='close("yes"); c()'>Yes</button>
                    <button class="btn btn-secondary" *ngIf='noButtonIsVisibile' (click)='close("no"); c()'>No</button>
                    <button class="btn btn-primary" *ngIf='okButtonIsVisibile' (click)='close("ok"); c()'>Ok</button>
                    <button class="btn btn-secondary" *ngIf='cancelButtonIsVisibile' (click)='close("cancel"); c()'>Cancel</button>
                </div>
            </div>
        </template>
    `
})
export class ConfirmDialogComponent {
    okButtonIsVisibile = false;
    cancelButtonIsVisibile = false;
    yesButtonIsVisibile = false;
    noButtonIsVisibile = false;
    private _model;
    @Input() set model(model: ConfirmModel) {
        this._model = model;
        this.okButtonIsVisibile = model.Buttons.indexOf("ok") > -1;
        this.cancelButtonIsVisibile = model.Buttons.indexOf("cancel") > -1;
        this.yesButtonIsVisibile = model.Buttons.indexOf("yes") > -1;
        this.noButtonIsVisibile = model.Buttons.indexOf("no") > -1;
    }
    get model() {
        return this._model;
    }

    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: true,
        keyboard: true,
        size: 'lg'
    };
    private dialogClosedEventSource = new Subject<ConfirmModel>();
    dialogClosed = this.dialogClosedEventSource.asObservable();

    constructor(private modal: NgbModal) {
    }

    open() {
        this.modal.open(this.template, this.modalOptions);
    }

    close(result: string) {
        switch (result) {
            case "ok":
                this.model.Result = DialogResult.Ok;
                break;
            case "yes":
                this.model.Result = DialogResult.Yes;
                break;
            case "no":
                this.model.Result = DialogResult.No;
                break;
            case "cancel":
                this.model.Result = DialogResult.Cancel;
                break;

            default:
                break;
        }
        this.dialogClosedEventSource.next(this.model);
        this.dialogClosedEventSource = new Subject<ConfirmModel>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
    }
}
