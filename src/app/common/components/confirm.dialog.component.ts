import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../../models/dialog-result';
import { ConfirmModel } from '../../models/confirm.model';
import { Subject } from 'rxjs';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'confirm-dialog',
    template: `
        <template #template>
            <div class="modal-header">
                <button type="button" class="close" aria-label="Close" (click)='close("cancel")'>
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title">{{model.Header}}</h4>
            </div>
            <div class="modal-body">
            <div class="progress" style="position: relative;" *ngIf="showProgress">
				<div class="progress-bar indeterminate"></div>
			</div>
            <div [innerHTML]=model.Message></div>
            </div>
            <div class="modal-footer">
                <div class="btn-group">
                    <button class="btn btn-primary" *ngIf='yesButtonIsVisibile' (click)='close("yes");'>Yes</button>
                    <button class="btn btn-secondary" *ngIf='noButtonIsVisibile' (click)='close("no");'>No</button>
                    <button class="btn btn-primary" *ngIf='okButtonIsVisibile' (click)='close("ok");'>Ok</button>
                    <button class="btn btn-secondary" *ngIf='cancelButtonIsVisibile' (click)='close("cancel");'>Cancel</button>
                </div>
            </div>
        </template>
    `,
    styles: [`
                .progress-bar.indeterminate {
                position: relative;
                animation: progress-indeterminate 3s linear infinite;
            }

            @keyframes progress-indeterminate {
                from { left: -25%; width: 25%; }
                to { left: 100%; width: 25%;}
            }`]
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
        size: 'lg'
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
