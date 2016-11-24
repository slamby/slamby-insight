import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Endpoint } from '../../models/endpoint';
import { StatusApi, IStatus } from 'slamby-sdk-angular2';
import { OptionService } from './option.service';
import { BaseService } from './base.service';

@Injectable()
export class StatusService extends BaseService<StatusApi> {
    constructor(private optionService: OptionService,  private _http: Http) {
        super(optionService.currentEndpoint ? new StatusApi(_http, optionService.currentEndpoint.ApiBaseEndpoint) : null,
            optionService.currentEndpoint ? optionService.currentEndpoint : null);
    }

    getStatus(): Observable<IStatus> {
        return this.apiService.getStatus();
    }

    setDefaultHeaders(endpoint: Endpoint) {
        if (!endpoint) {
            return;
        }

        this.initialize(new StatusApi(this._http, endpoint.ApiBaseEndpoint), endpoint);
    }
}
