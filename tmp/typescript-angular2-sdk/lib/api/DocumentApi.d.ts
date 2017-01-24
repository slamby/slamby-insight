import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as models from '../model/models';
import 'rxjs/Rx';
export declare class DocumentApi {
    protected http: Http;
    protected basePath: string;
    defaultHeaders: Headers;
    constructor(http: Http, basePath: string);
    bulkDocuments(settings?: models.IDocumentBulkSettings, extraHttpRequestParams?: any): Observable<models.IBulkResults>;
    copyDocuments(copySettings?: models.IDocumentCopySettings, extraHttpRequestParams?: any): Observable<models.IProcess>;
    createDocument(document?: any, extraHttpRequestParams?: any): Observable<{}>;
    deleteDocument(id: string, extraHttpRequestParams?: any): Observable<{}>;
    getDocument(id: string, extraHttpRequestParams?: any): Observable<any>;
    getFilteredDocuments(scrollId: string, filterSettings?: models.IDocumentFilterSettings, extraHttpRequestParams?: any): Observable<models.IPaginatedListObject>;
    getSampleDocuments(sampleSettings?: models.IDocumentSampleSettings, extraHttpRequestParams?: any): Observable<models.IPaginatedListObject>;
    moveDocuments(moveSettings?: models.IDocumentMoveSettings, extraHttpRequestParams?: any): Observable<models.IProcess>;
    updateDocument(id: string, document?: any, extraHttpRequestParams?: any): Observable<any>;
}
