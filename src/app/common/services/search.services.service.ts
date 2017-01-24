import { Injectable } from '@angular/core';
import { Http/*, Response*/ } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import {
    IProcess,
    SearchServiceApi, ISearchService, ISearchPrepareSettings, ISearchActivateSettings,
    ISearchRequest, ISearchResultWrapper
} from 'slamby-sdk-angular2';

import { OptionService } from './option.service';
import { BaseService } from './base.service';

@Injectable()
export class SearchServicesService extends BaseService<SearchServiceApi> {
    constructor(private optionService: OptionService, private _http: Http) {
        super(new SearchServiceApi(_http, optionService.currentEndpoint.ApiBaseEndpoint), optionService.currentEndpoint);
    }

    get(id: string): Observable<ISearchService> {
        this.setContentTypeHeader();
        return this.apiService.searchGetService(id);
    }

    prepare(id: string, settings: ISearchPrepareSettings): Observable<IProcess> {
        this.setContentTypeHeader();
        return this.apiService.searchPrepareService(id, settings);
    }

    activate(id: string, settings: ISearchActivateSettings): Observable<IProcess> {
        this.setContentTypeHeader();
        return this.apiService.searchActivateService(id, settings);
    }

    deactivate(id: string): any {
        this.setContentTypeHeader();
        return this.apiService.searchDeactivateService(id);
    }

    search(id: string, request: ISearchRequest): Observable<Array<ISearchResultWrapper>> {
        this.setContentTypeHeader();
        return this.apiService.searchService(id, request);
    }
}
