import { TemplateRef, Component, ViewChild, Input} from '@angular/core';

import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import { ProgressDialogModel } from '../../models/progress-dialog-model';
import * as _ from 'lodash';

@Component({
    selector: 'CommonTemplates',
    template: `
    <div>
        <template #progressTemplate let-c="close" let-d="dismiss">
            <div class="modal-header">
                <button type="button" class="close" aria-label="Close" (click)="d('Cross click')">
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title">{{progressModel.Header}}</h4>
            </div>
            <div class="modal-body">
                <ngb-progressbar [type]="progressModel.IsDone? 'success': 'info'" [value]=progressModel.Percent></ngb-progressbar>
                <div>
                    {{progressModel.Done}} / {{progressModel.All}}
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="c('Close click')" *ngIf="progressModel.IsDone">Close</button>
            </div>
        </template>
        <template #indeterminateProgressTemplate>
            <div class="modal-header">
                <h4 class="modal-title">{{progressModel.Header}}</h4>
            </div>
            <div class="modal-body">
                <div class="progress" style="position: relative;">
                    <div class="progress-bar indeterminate"></div>
                </div>
            </div>
        </template>
    </div>
    `,
    styles: [`
    .progress-bar.indeterminate {
        position: relative;
        animation: progress-indeterminate 3s linear infinite;
    }

    @keyframes progress-indeterminate {
        from { left: -25%; width: 25%; }
        to { left: 100%; width: 25%;}
    }
    `]
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
