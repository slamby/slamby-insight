import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as models from '../model/models';
import 'rxjs/Rx';
export declare class HelperApi {
    protected http: Http;
    protected basePath: string;
    defaultHeaders: Headers;
    constructor(http: Http, basePath: string);
    fileParser(fileParser?: models.IFileParser, extraHttpRequestParams?: any): Observable<models.IFileParserResult>;
}
