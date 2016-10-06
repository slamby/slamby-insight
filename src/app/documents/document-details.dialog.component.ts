import { Component, Input, ViewChild } from '@angular/core';
import {NgbModal,  NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'document-details-dialog',
    template: require('./document-details.dialog.component.html')
})
export class DocumentDetailsDialogComponent {
    @Input() document: any;
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
