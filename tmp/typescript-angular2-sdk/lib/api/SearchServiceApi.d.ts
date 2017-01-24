import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as models from '../model/models';
import 'rxjs/Rx';
export declare class SearchServiceApi {
    protected http: Http;
    protected basePath: string;
    defaultHeaders: Headers;
    constructor(http: Http, basePath: string);
    searchActivateService(id: string, searchActivateSettings?: models.ISearchActivateSettings, extraHttpRequestParams?: any): Observable<{}>;
    searchDeactivateService(id: string, extraHttpRequestParams?: any): Observable<{}>;
    searchGetService(id: string, extraHttpRequestParams?: any): Observable<models.ISearchService>;
    searchPrepareService(id: string, searchPrepareSettings?: models.ISearchPrepareSettings, extraHttpRequestParams?: any): Observable<{}>;
    searchService(id: string, request?: models.ISearchRequest, extraHttpRequestParams?: any): Observable<Array<models.ISearchResultWrapper>>;
}
