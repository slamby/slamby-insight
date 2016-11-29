import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { Response } from '@angular/http';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { DialogResult } from '../../models/dialog-result';
import { LicenseService } from '../../common/services/license.service';
import { Endpoint } from '../../models/endpoint';
import { ErrorsModelHelper } from '../helpers/errorsmodel.helper';
import { CommonHelper } from '../helpers/common.helper';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
    selector: 'sl-change-license-dialog',
    template: require('./change-license-dialog.component.html')
})
export class ChangeLicenseDialogComponent implements OnInit {
    @Input() endpoint: Endpoint = null;
    modalRef: NgbModalRef = null;

    newLicense: string = '';
    errorMessage: string = '';

    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'sm',
        windowClass: 'md-dialog'
    };

    constructor(private modal: NgbModal, private licenseService: LicenseService, private toastr: ToastsManager) {
    }

    ngOnInit() {
        this.newLicense = '';
    }

    open(): NgbModalRef {
        this.modalRef = this.modal.open(this.template, this.modalOptions);
        return this.modalRef;
    }

    validate(): boolean {
        let decodedLicense = '';

        try {
            decodedLicense = CommonHelper.fromBase64(this.newLicense);
        } catch (error) {
            this.errorMessage = `License key is not valid (base64). 
                Please make sure there are no empty spaces at the beginning or end of the key.`;
            return false;
        }

        let parser = new DOMParser();
        let doc = parser.parseFromString(decodedLicense, 'text/xml');

        if (doc.documentElement.nodeName === 'html') {
            this.errorMessage = `License content is not valid. 
                Please make sure there are no empty spaces at the beginning or end of the key.`;
            return false;
        }

        return true;
    }

    change() {
        this.errorMessage = '';

        if (!this.validate()) {
            return;
        }

        this.licenseService
            .changeLicense(this.newLicense)
            .subscribe(
            () => {
                this.toastr.success('License has changed successfully!');
                this.modalRef.close(DialogResult.Ok);
            },
            (response: Response) => {
                let errorsModel = ErrorsModelHelper.getFromResponse(response);
                let error = ErrorsModelHelper.getFirstError(errorsModel);
                this.errorMessage = error;
            });
    }
}
