import { Injectable } from '@angular/core';
import { Http/*, Response*/ } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

import { DataSetApi, IDataSet } from 'slamby-sdk-angular2';

import { BaseService } from './base.service';
import { OptionService } from './option.service';

@Injectable()
export class DatasetService extends BaseService<DataSetApi> {
    constructor(private optionService: OptionService, private _http: Http) {
        super(new DataSetApi(_http, optionService.currentEndpoint.ApiBaseEndpoint), optionService.currentEndpoint);
    }

    getDatasets(): Observable<IDataSet[]> {
        this.clearContentTypeHeader();
        return this.apiService.getDataSets();
    }

    getDataset(name: any): any {
        return this.apiService.getDataSet(name);
    }

    deleteDataset(name: any): any {
        this.clearContentTypeHeader();
        return this.apiService.deleteDataSet(name, null);
    }

    renameDataset(originalName: string, newName: string): any {
        this.setContentTypeHeader();
        return this.apiService.updateDataSet(originalName, { Name: newName });
    }

    createDatasetWithSampleDocument(dataset: IDataSet): any {
        this.setContentTypeHeader();
        return this.apiService.createDataSet(dataset);
    }

    createDatasetWithSchema(dataset: IDataSet): any {
        this.setContentTypeHeader();
        return this.apiService.createDataSetSchema(dataset);
    }

    // private handleError(error: Response) {
    //     // in a real world app, we may send the server to some remote logging infrastructure
    //     // instead of just logging it to the console
    //     console.error(error);
    //     return Observable.throw(error.json().error || 'Server error');
    // }
}
