import { Injectable } from '@angular/core';
import { Http/*, Response*/ } from '@angular/http';

import {
    DocumentApi, IDocumentFilterSettings, IPaginatedListObject, IDocumentBulkSettings, IBulkResults,
    IDocumentSampleSettings, IDocumentCopySettings, IDocumentMoveSettings
} from 'slamby-sdk-angular2';

import { OptionService } from './option.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

import { BaseService } from './base.service';

@Injectable()
export class DocumentService extends BaseService<DocumentApi> {
    constructor(private optionService: OptionService, private _http: Http) {
        super(new DocumentApi(_http, optionService.currentEndpoint.ApiBaseEndpoint), optionService.currentEndpoint);
    }

    getDocumentsByFilter(dataset: string, scrollId?: string, filterSettings?: IDocumentFilterSettings): Observable<IPaginatedListObject> {
        this.setContentTypeHeader();
        this.setDataSetHeader(dataset);
        if (scrollId) {
            return this.apiService.getFilteredDocuments(scrollId, null);
        } else {
            return this.apiService.getFilteredDocuments('', filterSettings);
        }
    }

    getDocumentsBySample(dataset: string, sampleSettings: IDocumentSampleSettings): Observable<IPaginatedListObject> {
        this.setContentTypeHeader();
        this.setDataSetHeader(dataset);
        return this.apiService.getSampleDocuments(sampleSettings);
    }

    getDocument(dataset: string, id: string): Observable<any> {
        this.setContentTypeHeader();
        this.setDataSetHeader(dataset);
        return this.apiService.getDocument(id);
    }

    bulkImport(dataset: string, documents: Array<any>): Observable<IBulkResults> {
        this.setContentTypeHeader();
        this.setDataSetHeader(dataset);
        let setting: IDocumentBulkSettings = {
            Documents: documents
        };
        return this.apiService.bulkDocuments(setting);
    }

    deleteDocument(dataset: string, id: string): Observable<{}> {
        this.clearContentTypeHeader();
        this.setDataSetHeader(dataset);
        return this.apiService.deleteDocument(id);
    }

    createDocument(dataset: string, document: any): Observable<{}> {
        this.setDataSetHeader(dataset);
        return this.apiService.createDocument(document);
    }

    updateDocument(dataset: string, id: string, document: any): Observable<{}> {
        this.setDataSetHeader(dataset);
        return this.apiService.updateDocument(id, document);
    }

    copyTo(sourceDataset: string, targetDataset: string, documentIds: Array<string>): Observable<{}> {
        let documentCopySettings: IDocumentCopySettings = {
            TargetDataSetName: targetDataset,
            DocumentIdList: documentIds
        };
        this.setContentTypeHeader();
        this.setDataSetHeader(sourceDataset);
        return this.apiService.copyDocuments(documentCopySettings);
    }

    moveTo(sourceDataset: string, targetDataset: string, documentIds: Array<string>): Observable<{}> {
        let documentMoveSettings: IDocumentMoveSettings = {
            TargetDataSetName: targetDataset,
            DocumentIdList: documentIds
        };
        this.setContentTypeHeader();
        this.setDataSetHeader(sourceDataset);
        return this.apiService.moveDocuments(documentMoveSettings);
    }

    // private handleError(error: Response) {
    //     // in a real world app, we may send the server to some remote logging infrastructure
    //     // instead of just logging it to the console
    //     console.error(error);
    //     return Observable.throw(error.json().error || 'Server error');
    // }
}
