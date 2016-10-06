import { Injectable } from '@angular/core';
import { Http/*, Response*/ } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { ServiceApi, IService } from 'slamby-sdk-angular2';

import { OptionService } from './option.service';
import { BaseService } from './base.service';

@Injectable()
export class ServicesService extends BaseService<ServiceApi> {
    constructor(private optionService: OptionService, private _http: Http) {
        super(new ServiceApi(_http, optionService.currentEndpoint.ApiBaseEndpoint), optionService.currentEndpoint);
    }

    getServices(): Observable<IService[]> {
        this.clearContentTypeHeader();
        return this.apiService.getServices();
    }

    getService(id: string): Observable<IService> {
        this.clearContentTypeHeader();
        return this.apiService.getService(id);
    }

    createService(service: IService): any {
        this.setContentTypeHeader();
        return this.apiService.createService(service);
    }

    deleteService(id: string): any {
        this.clearContentTypeHeader();
        return this.apiService.deleteService(id);
    }

    updateService(id: string, service: IService): Observable<IService> {
        this.setContentTypeHeader();
        return this.apiService.updateService(id, service);
    }

    // private handleError(error: Response) {
    //     // in a real world app, we may send the server to some remote logging infrastructure
    //     // instead of just logging it to the console
    //     console.error(error);
    //     return Observable.throw(error.json().error || 'Server error');
    // }
}
