import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

import { Endpoint } from '../../models/endpoint';
import { LicenseApi, ILicense, IChangeLicense } from 'slamby-sdk-angular2';
import { OptionService } from './option.service';
import { BaseService } from './base.service';

@Injectable()
export class LicenseService extends BaseService<LicenseApi> {
    constructor(private optionService: OptionService,  private _http: Http) {
        super(optionService.currentEndpoint ? new LicenseApi(_http, optionService.currentEndpoint.ApiBaseEndpoint) : null,
            optionService.currentEndpoint ? optionService.currentEndpoint : null);
    }

    getLicense(): Observable<ILicense> {
        return this.apiService.getLicense();
    }

    changeLicense(licenseBase64: string): Observable<{}> {
        this.setContentTypeHeader();
        return this.apiService.changeLicense(<IChangeLicense>{License: licenseBase64});
    }

    setEndpoint(endpoint: Endpoint) {
        if (!endpoint) {
            return;
        }

        this.initialize(new LicenseApi(this._http, endpoint.ApiBaseEndpoint), endpoint);
    }
}
