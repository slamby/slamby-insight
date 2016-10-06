import { Component, Input, ViewChild } from '@angular/core';
import { DialogResult } from '../../models/dialog-result';
import { CommonInputModel } from '../../models/common-input.model';
import { Subject } from 'rxjs';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'input-dialog',
    template: `
        <template #template let-c="close" let-d="dismiss">
            <div class="modal-header">
                <button type="button" class="close" aria-label="Close" (click)="cancel(); d('Cross click')">
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title">{{model.Header}}</h4>
            </div>
            <div *ngIf="model.ErrorMessage">
                <p>{{model.ErrorMessage}}</p>
            </div>
            <form (submit)="ok(); c()">
                <div class="modal-body">
                        <textarea [rows]="getRowNumber(_json)" style="width: 100%" name="jsonText" [(ngModel)]="_json">
                        </textarea>
                </div>
                <div class="modal-footer">
                    <button type="submit " class="btn btn-primary ">Ok</button>
                    <button type="button" class="btn btn-secondary" (click)="cancel(); c('Close click')">Close</button>
                </div>
            </form>
        </template>
    `
})
export class CommonInputDialogComponent {
    private _json: string;
    private _type: any;
    @Input() model: CommonInputModel;
    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };
    private dialogClosedEventSource = new Subject<CommonInputModel>();
    dialogClosed = this.dialogClosedEventSource.asObservable();

    constructor(private modal: NgbModal) {
    }

    open() {
        this._json = JSON.stringify(this.model.Model, null, 4);
        this._type = typeof this.model.Model;
        this.modal.open(this.template, this.modalOptions);
    }

    cancel() {
        this.model.Result = DialogResult.Cancel;
        this.dialogClosedEventSource.next(this.model);
        this.dialogClosedEventSource = new Subject<CommonInputModel>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
    }

    ok() {
        try {
            this.model.Model = JSON.parse(this._json);
            // if (typeof this.model.Model != this.model.Type)
            //     throw "Invalid Type";
        } catch (error) {
            this.model.ErrorMessage = error;
        }
        if (!this.model.ErrorMessage) {
            this.model.Result = DialogResult.Ok;
            this.dialogClosedEventSource.next(this.model);
            this.dialogClosedEventSource = new Subject<CommonInputModel>();
            this.dialogClosed = this.dialogClosedEventSource.asObservable();
        }
    }

    getRowNumber(text: string) {
        let numberOfLineBreaks = (text.match(/\n/g) || []).length;
        return numberOfLineBreaks + 1;
    }
}
