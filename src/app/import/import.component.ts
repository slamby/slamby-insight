import { Component, AfterContentInit, Input, Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable, Observer } from 'rxjs';

import { DocumentService } from '../common/services/document.service';
import { DatasetService } from '../common/services/dataset.service';
import { TagService } from '../common/services/tag.service';

import { IDataSet, IBulkResults, IBulkResult } from 'slamby-sdk-angular2';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';

import * as _ from 'lodash';
let papa = require('papaparse');

class ImportStatus {
    inProgress: boolean = false;
    percent: number = 0;
    get finished(): boolean {
        return this.percent === 100;
    }
    errorMessages: Array<string> = [];
}

@Component({
    template: require('./import.component.html'),
    styles: [require('./import.component.scss')]
})
@Injectable()
export class ImportComponent implements AfterContentInit {
    static pageTitle: string = 'Import';
    static pageIcon: string = 'fa-cloud-upload';

    @Input() datasets: Array<IDataSet>;
    selectedDataset: IDataSet;
    selectedFile: any;
    documents = new Array<any>();
    tagImport: boolean = false;
    csvSettings: any = {
        delimiter: ',',
        hasHeader: true
    };
    status: ImportStatus = new ImportStatus();

    constructor(private _documentService: DocumentService,
        private _datasetService: DatasetService,
        private _tagService: TagService,
        private _notificationService: NotificationService) {
    }

    ngAfterContentInit(): void {
        this._datasetService.getDatasets()
            .subscribe(datasets => {
                this.datasets = _.orderBy(datasets, ['Name'], ['asc']);
                if (this.datasets) {
                    this.selectedDataset = _.head(this.datasets);
                }
            },
            error => this.handleError(error));
    }

    onFileSelectionChange(event: any) {
        let files = event.srcElement.files;
        if (files) {
            this.selectedFile = files[0];
        }
    }

    isCsvFile(filename: string): boolean {
        return filename && filename.endsWith('.csv');
    }

    import(): void {
        this.status = new ImportStatus();
        this.status.inProgress = true;
        if (this.isCsvFile(this.selectedFile.name)) {
            this.importCsv().subscribe(x => console.log(x));
        } else {
            this.importJson().subscribe(x => console.log(x));
        }
    }

    importJson(): Observable<number> {
        let observableResult = Observable.create((observer: Observer<number>) => {
            let reader = new FileReader();
            reader.onloadend = () => {
                this.status.percent = 50;
                observer.next(this.status.percent);
                let parsedData = JSON.parse(reader.result);
                if (this.tagImport) {
                    this._tagService.bulkImport(this.selectedDataset.Name, parsedData)
                        .subscribe(bulkResults => {
                            this.addBulkErrors(bulkResults.Results);
                            this.status.percent = 100;
                            observer.next(this.status.percent);
                        },
                        error => {
                            this.status.errorMessages = <any>error;
                            observer.next(this.status.percent);
                        });
                } else {
                    this._documentService.bulkImport(this.selectedDataset.Name, parsedData)
                        .subscribe(bulkResults => {
                            this.addBulkErrors(bulkResults.Results);
                            this.status.percent = 100;
                            observer.next(this.status.percent);
                        },
                        error => {
                            this.status.errorMessages = <any>error;
                            observer.next(this.status.percent);
                        });
                }
            };
            reader.readAsText(this.selectedFile, 'utf-8');
        });
        return observableResult;
    }

    importCsv(): Observable<number> {
        let done = 0;
        let total: number = this.selectedFile.size;
        let chunkSize = 202400;
        let observableResult = Observable.create((observer: Observer<number>) => {
            papa.LocalChunkSize = chunkSize;
            papa.DefaultDelimiter = '';
            papa.parse(this.selectedFile, {
                delimiter: this.csvSettings.delimiter,	// empty string = auto-detect
                newline: '',	// empty string = auto-detect
                header: this.csvSettings.hasHeader,
                dynamicTyping: true,
                skipEmptyLines: true,
                encoding: 'utf-8',
                fastMode: false,
                chunk: (results, parser) => {
                    parser.pause();
                    let errorRows = [];
                    if (results.errors.length > 0) {
                        results.errors.forEach(e => {
                            this.status.errorMessages.push(e.message);
                            if (e.row) {
                                errorRows.push(e.row);
                            }
                        });
                    }
                    let filteredData = results.data;
                    filteredData.splice(...errorRows);
                    if (filteredData.length > 0) {
                        if (this.tagImport) {
                            filteredData.forEach(data => {
                                try {
                                    if (data['ParentId'] && data['ParentId'].toString().toLowerCase() === 'null') {
                                        data['ParentId'] = null;
                                    }
                                } catch (error) {
                                    console.log(data['Id']);
                                }
                            });
                            this._tagService.bulkImport(this.selectedDataset.Name, filteredData)
                                .subscribe((bulkResults: IBulkResults) => {
                                    this.addBulkErrors(bulkResults.Results);
                                    done += chunkSize;
                                    done = done > total ? total : done;
                                    this.status.percent = Math.ceil((done / total) * 100);
                                    observer.next(this.status.percent);
                                    parser.resume();
                                },
                                error => {
                                    let errorsModel = ErrorsModelHelper.getFromResponse(error);
                                    this.status.errorMessages = this.status.errorMessages.concat(errorsModel.Errors);
                                    observer.next(this.status.percent);
                                    parser.resume();
                                });
                        } else {
                            this._documentService.bulkImport(this.selectedDataset.Name, filteredData)
                                .subscribe((bulkResults: IBulkResults) => {
                                    this.addBulkErrors(bulkResults.Results);
                                    done += chunkSize;
                                    done = done > total ? total : done;
                                    this.status.percent = Math.ceil((done / total) * 100);
                                    observer.next(this.status.percent);
                                    parser.resume();
                                },
                                error => {
                                    this.status.errorMessages = <any>error;
                                    observer.next(this.status.percent);
                                    parser.resume();
                                });
                        }
                    }
                },
                complete: (result) => {
                    this.status.percent = 100;
                },
                error: (error) => {
                    this.status.errorMessages = error;
                }
            });
        });
        return observableResult;
    }

    addBulkErrors(results: IBulkResult[]) {
        this.status.errorMessages = this.status.errorMessages.concat(
            results.filter(r => r.StatusCode !== 200)
                .map(r => `Id: '${r.Id}' Error: ${r.Error}`));
    }

    handleError(response: Response) {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `Import error (${response.status})`);
    }
}
