import { Component, ViewChild } from '@angular/core';

import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sl-endpoint-dialog',
    template: require('./endpoint.dialog.component.html'),
    styles: [require('./endpoint.dialog.component.scss')]
})
export class EndpointDialogComponent {
    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };

    editing: boolean = false;

    constructor(private modal: NgbModal) {
    }

    open(): NgbModalRef {
        return this.modal.open(this.template, this.modalOptions);
    }

    onEditing(editing: boolean) {
        this.editing = editing;
    }
}
