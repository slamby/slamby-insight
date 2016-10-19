import { Component, ViewChild } from '@angular/core';

import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sl-settings-dialog',
    template: require('./settings.dialog.component.html')
})
export class SettingsDialogComponent {

    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };

    constructor(private modal: NgbModal) {
    }

    open(): NgbModalRef {
        return this.modal.open(this.template, this.modalOptions);
    }
}
