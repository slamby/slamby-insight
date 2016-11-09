import { Component, Input, ViewChild } from '@angular/core';
import { DatasetSelectorModel } from './dataset-selector.model';
import { DialogResult } from '../models/dialog-result';
import { Subject } from 'rxjs';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sl-dataset-selector',
    template: require('./dataset-selector.dialog.component.html')
})
export class DatasetSelectorDialogComponent {
    @Input() model: DatasetSelectorModel;
    @ViewChild('template') template;
    showProgress = false;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg',
        windowClass: 'md-dialog'
    };
    
    private dialogOpenedEventSource = new Subject();
    dialogOpened = this.dialogOpenedEventSource.asObservable();

    private dialogClosedEventSource = new Subject<DatasetSelectorModel>();
    dialogClosed = this.dialogClosedEventSource.asObservable();

    constructor(private modal: NgbModal) {
    }

    open() {
        this.modal.open(this.template, this.modalOptions);
        this.dialogOpenedEventSource.next();
    }

    cancel() {
        this.model.Result = DialogResult.Cancel;
        this.dialogClosedEventSource.next(this.model);
        this.dialogClosedEventSource = new Subject<DatasetSelectorModel>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
    }

    select() {
        this.model.Result = DialogResult.Ok;
        this.dialogClosedEventSource.next(this.model);
        this.dialogClosedEventSource = new Subject<DatasetSelectorModel>();
        this.dialogOpenedEventSource = new Subject();
        this.dialogOpened = this.dialogOpenedEventSource.asObservable();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
    }
}
