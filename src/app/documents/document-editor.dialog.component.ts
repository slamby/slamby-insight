import { Component, Input, ViewChild } from '@angular/core';
import { Response } from '@angular/http';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';
import { DialogResult } from '../models/dialog-result';
import { DocumentWrapper } from '../models/document-wrapper';
import { DocumentService } from '../common/services/document.service';

import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sl-document-editor-dialog',
    template: require('./document-editor.dialog.component.html'),
    styles: [require('./document-editor.dialog.component.scss')]
})
export class DocumentEditorDialogComponent {
    private _modalRef: NgbModalRef;
    json: string;
    @Input() model: DocumentWrapper;
    @Input() dataSetName: string;
    @ViewChild('template') template;

    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };

    inProgress: boolean = false;

    constructor(private modal: NgbModal, private _documentService: DocumentService) {
    }

    open(): NgbModalRef {
        this._modalRef = this.modal.open(this.template, this.modalOptions);
        this.inProgress = false;
        this.json = JSON.stringify(this.model.Document, null, 4);

        return this._modalRef;
    }

    cancel() {
        this._modalRef.dismiss();
    }

    ok() {
        this.inProgress = true;

        if (this.model.IsNew) {
            this.addNew();
        } else {
            this.update();
        }
    }

    addNew() {
        let document = JSON.parse(this.json);
        this._documentService.createDocument(this.dataSetName, document)
            .finally(() => {
                this.inProgress = false;
            })
            .subscribe(
            () => {
                this.model.Document = document;
                this._modalRef.close(DialogResult.Ok);
            },
            error => {
                this.model.ErrorMessage = this.getErrors(error);
            });
    }

    update() {
        let document = JSON.parse(this.json);
        this._documentService.updateDocument(this.dataSetName, this.model.Id, document)
            .finally(() => {
                this.inProgress = false;
            })
            .subscribe(
            updatedDoc => {
                this.model.Document = document;
                this._modalRef.close(DialogResult.Ok);
            },
            error => {
                this.model.ErrorMessage = this.getErrors(error);
            });
    }

    getErrors(response: Response): string {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        return errors;
    }
}
