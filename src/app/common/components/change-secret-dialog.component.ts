import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { DialogResult } from '../../models/dialog-result';
import { MaintenanceService } from '../../common/services/maintenance.service';
import { Endpoint } from '../../models/endpoint';

@Component({
    selector: 'sl-change-secret-dialog',
    template: require('./change-secret-dialog.component.html')
})
export class ChangeSecretDialogComponent implements OnInit {
    @Input() endpoint: Endpoint = null;
    modalRef: NgbModalRef = null;

    newSecret: string = '';

    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'sm',
        windowClass: 'md-dialog'
    };

    constructor(private modal: NgbModal, private maintenanceService: MaintenanceService) {
    }

    ngOnInit() {
        this.newSecret = '';
    }

    open(): NgbModalRef {
        this.modalRef =  this.modal.open(this.template, this.modalOptions);
        return this.modalRef;
    }

    change() {
        this.maintenanceService
            .changeSecret(this.newSecret)
            .subscribe(
                () => this.modalRef.close(DialogResult.Ok),
                e => alert(e));
    }
}
