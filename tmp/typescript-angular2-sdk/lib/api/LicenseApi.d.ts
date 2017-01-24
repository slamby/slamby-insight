import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as models from '../model/models';
import 'rxjs/Rx';
export declare class LicenseApi {
    protected http: Http;
    protected basePath: string;
    defaultHeaders: Headers;
    constructor(http: Http, basePath: string);
    changeLicense(model?: models.IChangeLicense, extraHttpRequestParams?: any): Observable<{}>;
    getLicense(extraHttpRequestParams?: any): Observable<models.ILicense>;
}
