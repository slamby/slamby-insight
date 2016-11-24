import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { MaintenanceApi, IChangeSecret } from 'slamby-sdk-angular2';
import { OptionService } from './option.service';
import { BaseService } from './base.service';

@Injectable()
export class MaintenanceService extends BaseService<MaintenanceApi> {
    constructor(private optionService: OptionService,  private _http: Http) {
        super(optionService.currentEndpoint ? new MaintenanceApi(_http, optionService.currentEndpoint.ApiBaseEndpoint) : null,
            optionService.currentEndpoint ? optionService.currentEndpoint : null);
    }

    changeSecret(secret: string) {
        this.setContentTypeHeader();
        return this.apiService.changeSecret(<IChangeSecret>{Secret: secret});
    }
}
