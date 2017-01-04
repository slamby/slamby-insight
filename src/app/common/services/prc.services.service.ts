import { Injectable } from '@angular/core';
import { Http/*, Response*/ } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import {
    IProcess, IExportDictionariesSettings,
    PrcServiceApi, IPrcService, IPrcPrepareSettings, IPrcActivateSettings, IPrcRecommendationRequest,
    IPrcRecommendationByIdRequest, IPrcRecommendationResult,
    IPrcIndexSettings, IPrcKeywordsRequest, IPrcKeywordsResult
} from 'slamby-sdk-angular2';

import { OptionService } from './option.service';
import { BaseService } from './base.service';


@Injectable()
export class PrcServicesService extends BaseService<PrcServiceApi> {

    constructor(private optionService: OptionService, private _http: Http) {
        super(new PrcServiceApi(_http, optionService.currentEndpoint.ApiBaseEndpoint), optionService.currentEndpoint);
    }

    get(id: string): Observable<IPrcService> {
        this.setContentTypeHeader();
        return this.apiService.prcGetService(id);
    }

    prepare(id: string, settings: IPrcPrepareSettings): Observable<IProcess> {
        this.setContentTypeHeader();
        return this.apiService.prcPrepareService(id, settings);
    }

    activate(id: string, settings: IPrcActivateSettings): Observable<IProcess> {
        this.setContentTypeHeader();
        return this.apiService.prcActivateService(id, settings);
    }

    deactivate(id: string): any {
        this.setContentTypeHeader();
        return this.apiService.prcDeactivateService(id);
    }

    exportDictionary(id: string, settings: IExportDictionariesSettings): Observable<IProcess> {
        this.setContentTypeHeader();
        return this.apiService.prcExportDictionaries(id, settings);
    }

    recommend(id: string, request: IPrcRecommendationRequest): Observable<Array<IPrcRecommendationResult>> {
        this.setContentTypeHeader();
        return this.apiService.prcRecommendService(id, request);
    }

    recommendById(id: string, request: IPrcRecommendationByIdRequest): Observable<Array<IPrcRecommendationResult>> {
        this.setContentTypeHeader();
        return this.apiService.prcRecommendByIdService(id, request);
    }

    index(id: string, settings: IPrcIndexSettings): Observable<IProcess> {
        this.setContentTypeHeader();
        return this.apiService.prcIndexService(id, settings);
    }

    indexPartial(id: string): Observable<IProcess> {
        this.setContentTypeHeader();
        return this.apiService.prcIndexPartialService(id);
    }

    keywords(id: string, request: IPrcKeywordsRequest, isStrict = false): Observable<Array<IPrcKeywordsResult>> {
        this.setContentTypeHeader();
        return this.apiService.prcKeywordsService(id, request, isStrict);
    }
}
