import { Component, AfterContentInit, Input, Output, EventEmitter, Renderer, ViewChild, ElementRef } from '@angular/core';

import { Endpoint } from '../../../models/endpoint';
import { IpcHelper } from '../../../common/helpers/ipc.helper';
import { CommonHelper } from '../../../common/helpers/common.helper';

import { OptionService } from '../../../common/services/option.service';
import { StatusService } from '../../../common/services/status.service';
import { ErrorsModelHelper } from '../../../common/helpers/errorsmodel.helper';

import { DialogResult } from '../../../models/dialog-result';
import { ChangeSecretDialogComponent } from '../../../common/components/change-secret-dialog.component';

import * as _ from 'lodash';

@Component({
    selector: 'sl-endpoint-editor',
    template: require('./endpoint.component.html'),
    styles: [require('./endpoint.component.scss')]
})
export class EndpointComponent implements AfterContentInit {
    static pageTitle: string = 'Endpoints';
    static pageIcon: string = 'fa-plug';

    @Input() showSelectAction: boolean = true;
    @Output() onEditing: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild('endpointElement') endpointElement: ElementRef;
    @ViewChild(ChangeSecretDialogComponent) changeSecretDialog: ChangeSecretDialogComponent;


    endpointMaintenanceIsInProgress = false;
    endpoints: Array<Endpoint> = [];
    selectedEndpoint: Endpoint;

    pendingEndpoint: Endpoint = this.getDefaultEndpoint();
    secretRevealed: Endpoint;

    isCurrentEndpoint = (endpoint: Endpoint): boolean => this.equals(endpoint, this.selectedEndpoint);
    canSelect = (endpoint: Endpoint): boolean => this.showSelectAction &&
        !(this.endpointMaintenanceIsInProgress || this.equals(endpoint, this.selectedEndpoint));
    canEdit = (endpoint: Endpoint): boolean => !(this.endpointMaintenanceIsInProgress);
    canDelete = (endpoint: Endpoint): boolean => !(this.endpointMaintenanceIsInProgress || this.isCurrentEndpoint(endpoint));
    canModifySecret = (endpoint: Endpoint): boolean => !this.endpointMaintenanceIsInProgress && this.isCurrentEndpoint(endpoint);

    constructor(private optionService: OptionService, private _statusService: StatusService,
        private renderer: Renderer) {
    }

    ngAfterContentInit() {
        let settings = IpcHelper.getSettings();

        this.endpoints = IpcHelper.getEndpoints(settings);
        this.selectedEndpoint = this.optionService.currentEndpoint;
        this.onEditing.emit(false);
    }

    save() {
        this.saveInternal(this.pendingEndpoint);
        this.cancelEdit();
    }

    private saveInternal(endpoint: Endpoint) {
        let reload = this.equals(endpoint, this.selectedEndpoint);
        if (endpoint.ApiBaseEndpoint.endsWith('/')) {
            endpoint.ApiBaseEndpoint = endpoint.ApiBaseEndpoint.slice(0, -1);
        }
        if (endpoint.Id) {
            let index = this.endpoints.indexOf(this.endpoints.find(e => e.Id === endpoint.Id));
            this.endpoints[index] = endpoint;
        } else {
            endpoint.Id = CommonHelper.guid();
            this.endpoints.push(_.cloneDeep(endpoint));
        }

        IpcHelper.setEndpoints(this.endpoints);
        if (reload) {
            this.select(this.endpoints.find(e => e.Id === endpoint.Id));
        }
    }

    select(endpoint: Endpoint) {
        this._statusService.setDefaultHeaders(endpoint);
        this._statusService.getStatus()
            .subscribe(
            (status) => {
                IpcHelper.reload(endpoint);
            },
            (response) => {
                let model = ErrorsModelHelper.getFromResponse(response);
                let errors = ErrorsModelHelper.concatErrors(model);
                alert(errors);
            });
    }

    delete(endpoint: Endpoint) {
        let index = this.endpoints.indexOf(endpoint);
        this.endpoints.splice(index, 1);

        IpcHelper.setEndpoints(this.endpoints);
    }

    edit(endpoint: Endpoint) {
        this.pendingEndpoint = _.cloneDeep(endpoint);
        this.openEditor();
    }

    add() {
        this.pendingEndpoint = this.getDefaultEndpoint();
        this.openEditor();
    }

    openEditor() {
        this.endpointMaintenanceIsInProgress = true;
        this.onEditing.emit(true);
        setTimeout(() => this.renderer.invokeElementMethod(this.endpointElement.nativeElement, 'focus', []), 50);
    }

    cancelEdit() {
        this.endpointMaintenanceIsInProgress = false;
        this.onEditing.emit(false);
    }

    reveal(endpoint: Endpoint) {
        if (this.secretRevealed === endpoint) {
            this.secretRevealed = null;
        } else {
            this.secretRevealed = endpoint;
        }
    }

    modifySecret(endpoint: Endpoint) {
        this.changeSecretDialog.open()
            .result.then((result) => {
                if (result === DialogResult.Ok) {
                    endpoint.ApiSecret = this.changeSecretDialog.newSecret;
                    this.saveInternal(endpoint);
                }
            }, (reason) => {
            });
    }

    equals(first: Endpoint, second: Endpoint): boolean {
        return first && second && first.Id === second.Id;
    }

    getDefaultEndpoint(): Endpoint {
        return {
            ApiBaseEndpoint: 'https://europe.slamby.com/',
            ApiSecret: 's3cr3t',
            BulkSize: 1000,
            Id: null,
            ParallelLimit: 0,
            Timeout: '00:05:00'
        };
    }
}
