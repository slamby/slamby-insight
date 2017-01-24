import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as models from '../model/models';
import 'rxjs/Rx';
export declare class ClassifierServiceApi {
    protected http: Http;
    protected basePath: string;
    defaultHeaders: Headers;
    constructor(http: Http, basePath: string);
    classifierActivateService(id: string, classifierActivateSettings?: models.IClassifierActivateSettings, extraHttpRequestParams?: any): Observable<models.IProcess>;
    classifierDeactivateService(id: string, extraHttpRequestParams?: any): Observable<{}>;
    classifierExportDictionaries(id: string, settings?: models.IExportDictionariesSettings, extraHttpRequestParams?: any): Observable<models.IProcess>;
    classifierGetService(id: string, extraHttpRequestParams?: any): Observable<models.IClassifierService>;
    classifierPrepareService(id: string, classifierPrepareSettings?: models.IClassifierPrepareSettings, extraHttpRequestParams?: any): Observable<models.IProcess>;
    classifierRecommendService(id: string, request?: models.IClassifierRecommendationRequest, extraHttpRequestParams?: any): Observable<Array<models.IClassifierRecommendationResult>>;
}
