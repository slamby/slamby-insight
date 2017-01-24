import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as models from '../model/models';
import 'rxjs/Rx';
export declare class TagApi {
    protected http: Http;
    protected basePath: string;
    defaultHeaders: Headers;
    constructor(http: Http, basePath: string);
    bulkTags(settings?: models.ITagBulkSettings, extraHttpRequestParams?: any): Observable<models.IBulkResults>;
    cleanDocuments(extraHttpRequestParams?: any): Observable<{}>;
    createTag(tag?: models.ITag, extraHttpRequestParams?: any): Observable<models.ITag>;
    deleteTag(id: string, force?: boolean, cleanDocuments?: boolean, extraHttpRequestParams?: any): Observable<{}>;
    getTag(id: string, withDetails?: boolean, extraHttpRequestParams?: any): Observable<models.ITag>;
    getTags(withDetails?: boolean, extraHttpRequestParams?: any): Observable<Array<models.ITag>>;
    updateTag(id: string, tag?: models.ITag, extraHttpRequestParams?: any): Observable<{}>;
    wordsExport(settings?: models.ITagsExportWordsSettings, extraHttpRequestParams?: any): Observable<models.IProcess>;
}
