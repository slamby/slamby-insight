import { OptionService } from './../common/services/option.service';
import { Component, AfterContentInit, Input, Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable, Observer, Subscription } from 'rxjs';

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
    finished: boolean = false;
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
    bulkSize = 1000;
    tagImport: boolean = false;
    csvSettings: any = {
        delimiter: ',',
        hasHeader: true
    };
    private _importSubscription: Subscription;
    private _readIsCompleted: boolean;
    private _actionSubscription: Subscription;
    private _reader;
    private _isCancelled;
    status: ImportStatus = new ImportStatus();

    constructor(private _documentService: DocumentService,
        private _datasetService: DatasetService,
        private _tagService: TagService,
        private _optionService: OptionService,
        private _notificationService: NotificationService) {
        this.bulkSize = this._optionService.currentEndpoint.BulkSize;
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

    cancel() {
        if (this._actionSubscription) {
            this._actionSubscription.unsubscribe();
        }
        if (this._reader) {
            this._reader.abort();
        }
        this._isCancelled = true;
        this.status.finished = true;
        this.status.inProgress = false;
    }

    import(): void {
        this._isCancelled = false;
        this.status = new ImportStatus();
        this.status.inProgress = true;
        this.status.finished = false;
        if (this.isCsvFile(this.selectedFile.name)) {
            this._actionSubscription = this.importCsv().subscribe();
        } else {
            this._actionSubscription = this.importJson().subscribe();
        }
    }

    importJson(): Observable<number> {
        let observableResult = Observable.create((observer: Observer<number>) => {
            this._reader = new FileReader();
            this._reader.onloadend = () => {
                this.status.percent = 50;
                observer.next(this.status.percent);
                try {
                    let parsedData = JSON.parse(this._reader.result);
                    if (this.tagImport) {
                        this._tagService.bulkImport(this.selectedDataset.Name, parsedData)._finally(() => {
                            this.status.finished = true;
                            this.status.inProgress = false;
                        }).subscribe(bulkResults => {
                            this.addBulkErrors(bulkResults.Results);
                            this.status.percent = 100;
                            observer.next(this.status.percent);
                        },
                            error => {
                                this.status.errorMessages = <any>error;
                                observer.next(this.status.percent);
                            });
                    } else {
                        this._documentService.bulkImport(this.selectedDataset.Name, parsedData)._finally(() => {
                            this.status.finished = true;
                            this.status.inProgress = false;
                        }).subscribe(bulkResults => {
                            this.addBulkErrors(bulkResults.Results);
                            this.status.percent = 100;
                            observer.next(this.status.percent);
                        },
                            error => {
                                this.status.errorMessages = <any>error;
                                observer.next(this.status.percent);
                            });
                    }
                } catch (error) {
                    this.status.errorMessages = [error.toString()];
                    this.status.inProgress = false;
                    observer.next(this.status.percent);
                    this.status.finished = true;
                }
            };
            this._reader.readAsText(this.selectedFile, 'utf-8');
        });
        this._reader = null;
        return observableResult;
    }

    importCsv(): Observable<number> {
        let done = 0;
        let total: number = this.selectedFile.size;
        let pendingItems = [];
        let chunkSize = papa.LocalChunkSize;
        let observableResult = Observable.create((observer: Observer<number>) => {
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
                    if (this._isCancelled) {
                        parser.abort();
                    }
                    else {
                        let errorRows = [];
                        if (results.errors.length > 0) {
                            results.errors.forEach(e => {
                                this.status.errorMessages.push(e.message);
                                if (e.row) {
                                    errorRows.push(e.row);
                                }
                            });
                        }
                        let filteredData = results.data.map(d=>{
                            delete d.__parsed_extra;
                            return d;
                        });
                        if (this.selectedDataset.SampleDocument) {
                            if (_.isArray(this.selectedDataset.SampleDocument[this.selectedDataset.TagField])) {
                                filteredData = filteredData.map(d => {
                                    d[this.selectedDataset.TagField] = [d[this.selectedDataset.TagField]];
                                    return d;
                                });
                            }
                        }
                        else {
                            if (this.selectedDataset.Schema["properties"][this.selectedDataset.TagField]["type"] == "array") {
                                filteredData = filteredData.map(d => {
                                    d[this.selectedDataset.TagField] = [d[this.selectedDataset.TagField]];
                                    return d;
                                });
                            }
                        }
                        filteredData.splice(...errorRows);
                        if (filteredData.length > 0) {
                            pendingItems.push(...filteredData);
                            if (pendingItems.length >= this.bulkSize) {
                                let length = _.chunk(pendingItems, this.bulkSize).length;
                                this._importSubscription = this.bulkImport(pendingItems)
                                    .finally(() => {
                                        pendingItems = [];
                                        this.complete();
                                        if (!this._readIsCompleted) {
                                            parser.resume();
                                        }
                                    })
                                    .subscribe(
                                    (bulkResults: IBulkResults) => {
                                        this.addBulkErrors(bulkResults.Results);
                                        done += total < chunkSize ? total / length : chunkSize / length;
                                        done = done > total ? total : done;
                                        this.status.percent = Math.ceil((done / total) * 100);
                                        observer.next(this.status.percent);
                                    },
                                    error => {
                                        let errorsModel = ErrorsModelHelper.getFromResponse(error);
                                        this.status.errorMessages = this.status.errorMessages.concat(errorsModel.Errors);
                                        done += total < chunkSize ? total / length : chunkSize / length;
                                        done = done > total ? total : done;
                                        this.status.percent = Math.ceil((done / total) * 100);
                                        observer.next(this.status.percent);
                                    });
                            }
                            else {
                                if (!this._readIsCompleted) {
                                    parser.resume();
                                }
                            }
                        }
                        else {
                            if (!this._readIsCompleted) {
                                parser.resume();
                            }
                        }
                    }
                },
                complete: (result) => {
                    this._readIsCompleted = true;
                },
                error: (error) => {
                    this.status.errorMessages = error;
                    this.status.finished = true;
                    this.status.inProgress = false;
                }
            });
        });
        return observableResult;
    }

    complete() {
        if (this._isCancelled) {
            this.status.percent = 100;
            this.status.inProgress = false;
            this.status.finished = true;
        }
        else if (this._importSubscription.closed && this._readIsCompleted) {
            this.status.finished = true;
            this.status.inProgress = false;
        }
    }

    bulkImport(pendingItems: Array<any>): Observable<any> {
        let sources = _.chunk(pendingItems, this.bulkSize).map<Observable<any>>(pendingChunk => {
            return Observable.create((observer: Observer<any>) => {
                if (this.tagImport) {
                    pendingItems.forEach(data => {
                        try {
                            if (data['ParentId'] && data['ParentId'].toString().toLowerCase() === 'null') {
                                data['ParentId'] = null;
                            }
                        } catch (error) {
                            console.log(data['Id']);
                        }
                    });
                    this._tagService.bulkImport(this.selectedDataset.Name, pendingChunk)
                        .finally(() => observer.complete())
                        .subscribe(
                        (bulkResults: IBulkResults) => observer.next(bulkResults),
                        error => observer.error(error));
                }
                else {
                    this._documentService.bulkImport(this.selectedDataset.Name, pendingChunk)
                        .finally(() => observer.complete())
                        .subscribe(
                        (bulkResults: IBulkResults) => observer.next(bulkResults),
                        error => observer.error(error));
                }
            });
        });
        let source = Observable.concat(...sources);
        return source;
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
