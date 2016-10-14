import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';

import { EndpointDialogComponent } from '../settings/settings-menu-items/endpoint/endpoint.dialog.component';
import { Endpoint } from '../models/endpoint';
import { IpcHelper } from '../common/helpers/ipc.helper';
import { StatusService } from '../common/services/status.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';

@Component({
    selector: 'logon',
    template: require('./logon.component.html'),
    styles: [require('./logon.component.scss')]
})
export class LogonComponent implements OnInit {

    @ViewChild('endpointDialog') endpointDialog: EndpointDialogComponent;
    @Output() onSelected = new EventEmitter<Endpoint>();

    endpoints: Endpoint[] = [];
    busy: boolean = false;

    constructor(private _statusService: StatusService) {
    }

    ngOnInit() {
        let globals = IpcHelper.getGlobals();
        if (globals.selectedEndpoint != null) {
            this.onSelected.emit(globals.selectedEndpoint);
            return;
        }

        this.endpoints = IpcHelper.getEndpoints();
    }

    selectEndpoint(endpoint: Endpoint) {
        this.busy = true;
        this._statusService.setDefaultHeaders(endpoint);
        this._statusService.getStatus()
            .subscribe(
            (status) => {
                this.onSelected.emit(endpoint);
            },
            (response) => {
                let model = ErrorsModelHelper.getFromResponse(response);
                let errors = ErrorsModelHelper.concatErrors(model);
                alert(errors ? errors : 'Server not found');
                this.busy = false;
            });
    }

    manage() {
        this.endpointDialog.open().result
            .then((data) => this.endpoints = IpcHelper.getEndpoints());
    }
}
