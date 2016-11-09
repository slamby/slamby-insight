import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../models/dialog-result';
import { Subject } from 'rxjs';
import { CommonInputModel } from '../models/common-input.model';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sl-service-maintenance-dialog',
    template: require('./service-maintenance.dialog.component.html'),
    styles: [require('./service-maintenance.dialog.component.scss')]
})
export class ServiceMaintenanceDialogComponent {
    private _modalRef: any;
    @Input() model: CommonInputModel;
    @ViewChild('template') template;
    select;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };
    showProgress = false;
    private dialogClosedEventSource = new Subject<CommonInputModel>();
    dialogClosed = this.dialogClosedEventSource.asObservable();

    private dialogOpenedEventSource = new Subject();
    dialogOpened = this.dialogOpenedEventSource.asObservable();

    constructor(private modal: NgbModal) {
    }

    open() {
        if (this.model.Type) {
            this.select = [this.model.Type];
        }
        this.showProgress = false;
        this._modalRef = this.modal.open(this.template, this.modalOptions);
        this.dialogOpenedEventSource.next();
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
        this.dialogClosedEventSource = new Subject<CommonInputModel>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
        this.dialogOpenedEventSource = new Subject();
        this.dialogOpened = this.dialogOpenedEventSource.asObservable();
        this._modalRef.close();
    }
}
