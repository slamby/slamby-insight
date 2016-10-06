import { Component, Input, ViewChild } from '@angular/core';
import { CommonOutputModel } from '../../models/common-output.model';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'output-dialog',
    template: `
        <template #template let-c="close" let-d="dismiss">
            <div class="modal-header">
                <button type="button" class="close" aria-label="Close" (click)="d('Cross click')">
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title">{{model.Header}}</h4>
            </div>
            <div *ngIf="model.ErrorMessage">
                <p>{{model.ErrorMessage}}</p>
            </div>
                <div class="modal-body">
                        <DocumentDetails [document]="model.OutputObject">
                        </DocumentDetails>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" (click)="c('Close click')">Close</button>
                </div>
        </template>
    `
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
