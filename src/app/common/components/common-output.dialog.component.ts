import { Component, Input, ViewChild } from '@angular/core';
import { CommonOutputModel } from '../../models/common-output.model';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sl-output-dialog',
    template: require('./common-output.dialog.component.html'),
    styles: [require('./common-output.dialog.component.scss')]
})
export class CommonOutputDialogComponent {
    @Input() model: CommonOutputModel;
    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: true,
        keyboard: true,
        size: 'lg'
    };

    constructor(private modal: NgbModal) {
    }

    open() {
        this.modal.open(this.template, this.modalOptions);
    }
}
