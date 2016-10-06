import { Injectable } from '@angular/core';
import { Http/*, Response*/ } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import {
    IProcess, IExportDictionariesSettings,
    ClassifierServiceApi, IClassifierService, IClassifierPrepareSettings, IClassifierActivateSettings,
    IClassifierRecommendationRequest, IClassifierRecommendationResult
} from 'slamby-sdk-angular2';

import { OptionService } from './option.service';
import { BaseService } from './base.service';

@Injectable()
export class ClassifierServicesService extends BaseService<ClassifierServiceApi> {
    constructor(private optionService: OptionService, private _http: Http) {
        super(new ClassifierServiceApi(_http, optionService.currentEndpoint.ApiBaseEndpoint), optionService.currentEndpoint);
    }

    get(id: string): Observable<IClassifierService> {
        this.setContentTypeHeader();
        return this.apiService.classifierGetService(id);
    }

    prepare(id: string, settings: IClassifierPrepareSettings): Observable<IProcess> {
        this.setContentTypeHeader();
        return this.apiService.classifierPrepareService(id, settings);
    }

    activate(id: string, settings: IClassifierActivateSettings): Observable<IProcess> {
        this.setContentTypeHeader();
        return this.apiService.classifierActivateService(id, settings);
    }

    deactivate(id: string): any {
        this.setContentTypeHeader();
        return this.apiService.classifierDeactivateService(id);
    }

    exportDictionary(id: string, settings: IExportDictionariesSettings): Observable<IProcess> {
        this.setContentTypeHeader();
        return this.apiService.classifierExportDictionaries(id, settings);
    }

    recommend(id: string, request: IClassifierRecommendationRequest): Observable<Array<IClassifierRecommendationResult>> {
        this.setContentTypeHeader();
        return this.apiService.classifierRecommendService(id, request);
    }
}
