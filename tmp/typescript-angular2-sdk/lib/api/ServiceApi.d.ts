import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as models from '../model/models';
import 'rxjs/Rx';
export declare class ServiceApi {
    protected http: Http;
    protected basePath: string;
    defaultHeaders: Headers;
    constructor(http: Http, basePath: string);
    createService(service?: models.IService, extraHttpRequestParams?: any): Observable<{}>;
    deleteService(id: string, extraHttpRequestParams?: any): Observable<{}>;
    getService(id: string, extraHttpRequestParams?: any): Observable<models.IService>;
    getServices(extraHttpRequestParams?: any): Observable<Array<models.IService>>;
    updateService(id: string, service?: models.IService, extraHttpRequestParams?: any): Observable<models.IService>;
}
