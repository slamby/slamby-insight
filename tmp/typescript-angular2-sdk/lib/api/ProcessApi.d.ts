import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as models from '../model/models';
import 'rxjs/Rx';
export declare class ProcessApi {
    protected http: Http;
    protected basePath: string;
    defaultHeaders: Headers;
    constructor(http: Http, basePath: string);
    cancelProcess(id: string, extraHttpRequestParams?: any): Observable<{}>;
    getProcess(id: string, extraHttpRequestParams?: any): Observable<models.IProcess>;
    getProcesses(allStatus?: boolean, allTime?: boolean, extraHttpRequestParams?: any): Observable<Array<models.IProcess>>;
}
