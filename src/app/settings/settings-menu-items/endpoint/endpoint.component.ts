import { Component, AfterContentInit, Input } from '@angular/core';

import { Endpoint } from '../../../models/endpoint';
import { IpcHelper } from '../../../common/helpers/ipc.helper';
import { CommonHelper } from '../../../common/helpers/common.helper';

import { OptionService } from '../../../common/services/option.service';
import { StatusService  } from '../../../common/services/status.service';
import { ErrorsModelHelper } from '../../../common/helpers/errorsmodel.helper';

import * as _ from 'lodash';

@Component({
    selector: 'endpoint-editor',
    template: require('./endpoint.component.html'),
    styles: [require('./endpoint.component.scss')]
})
export class EndpointComponent implements AfterContentInit {
    static pageTitle: string = 'Endpoints';
    static pageIcon: string = 'fa-plug';

    @Input() showSelectAction: boolean = true;

    endpointMaintenanceIsInProgress = false;
    endpoints: Array<Endpoint> = [];
    selectedEndpoint: Endpoint;

    pendingEndpoint: Endpoint = this.getDefaultEndpoint();
    secretRevealed: Endpoint;

    canSelect = (endpoint: Endpoint): boolean => this.showSelectAction &&
        !(this.endpointMaintenanceIsInProgress || this.equals(endpoint, this.selectedEndpoint));
    canEdit = (endpoint: Endpoint): boolean => !(this.endpointMaintenanceIsInProgress);
    canDelete = (endpoint: Endpoint): boolean => !(this.endpointMaintenanceIsInProgress || this.equals(endpoint, this.selectedEndpoint));

    constructor(private optionService: OptionService, private _statusService: StatusService) {
    }

    ngAfterContentInit() {
        let settings = IpcHelper.getSettings();

        this.endpoints = IpcHelper.getEndpoints(settings);
        this.selectedEndpoint = this.optionService.currentEndpoint;
    }

    save() {
        let reload = this.equals(this.pendingEndpoint, this.selectedEndpoint);

        if (this.pendingEndpoint.Id) {
            let index = this.endpoints.indexOf(this.endpoints.find(e => e.Id === this.pendingEndpoint.Id));
            this.endpoints[index] = this.pendingEndpoint;
        } else {
            this.pendingEndpoint.Id = CommonHelper.guid();
            this.endpoints.push(_.cloneDeep(this.pendingEndpoint));
        }

        IpcHelper.setEndpoints(this.endpoints);
        if (reload) {
            this.select(this.selectedEndpoint);
        } else {
            this.collapse();
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
                    alert (errors);
                });
    }

    delete(endpoint: Endpoint) {
        let index = this.endpoints.indexOf(endpoint);
        this.endpoints.splice(index, 1);

        IpcHelper.setEndpoints(this.endpoints);
    }

    edit(endpoint: Endpoint) {
        this.endpointMaintenanceIsInProgress = true;
        this.pendingEndpoint = _.cloneDeep(endpoint);
    }

    collapse() {
        this.endpointMaintenanceIsInProgress = !this.endpointMaintenanceIsInProgress;
        if (!this.endpointMaintenanceIsInProgress) {
            this.pendingEndpoint = this.getDefaultEndpoint();
        }
    }

    reveal(endpoint: Endpoint) {
        if (this.secretRevealed === endpoint) {
            this.secretRevealed = null;
        } else {
            this.secretRevealed = endpoint;
        }
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
