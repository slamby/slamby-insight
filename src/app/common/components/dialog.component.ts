import { TemplateRef, Component, ViewChild, Input} from '@angular/core';

import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import { ProgressDialogModel } from '../../models/progress-dialog-model';
import * as _ from 'lodash';

@Component({
    selector: 'CommonTemplates',
    template: require('./dialog.component.html'),
    styles: [require('./dialog.component.scss')]
})
export class DialogComponent {

    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        size: 'sm'
    };
    @ViewChild('progressTemplate') progressTemplate;
    @ViewChild('indeterminateProgressTemplate') indeterminateProgressTemplate;
    @Input() progressModel: ProgressDialogModel;

    private _dialogRef: NgbModalRef;

    constructor(private modalService: NgbModal) {

    }

    openDialog(template: string | TemplateRef<any>) {
        if (_.isString(template)) {
            if (template === 'progress') {
                this._dialogRef = this.modalService.open(this.progressTemplate, this.modalOptions);
            } else if (template === 'indeterminateprogress') {
                this._dialogRef = this.modalService.open(this.indeterminateProgressTemplate, this.modalOptions);
            }
        } else if (template instanceof TemplateRef) {
            this._dialogRef = this.modalService.open(template, this.modalOptions);
        }
    }

    close() {
        this._dialogRef.close();
    }
}
