import { Component, OnInit, Input, Injectable}  from '@angular/core';
import { Response }  from '@angular/http';
import { Observable, Observer } from 'rxjs';

import { DocumentService } from '../common/services/document.service';
import { DatasetService } from '../common/services/dataset.service';
import { TagService } from '../common/services/tag.service';

import { IDataSet } from 'slamby-sdk-angular2';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';

let papa = require('papaparse');

@Component({
    template: require('./import.component.html'),
    styles: [require('./import.component.scss')]
})
@Injectable()
export class ImportComponent implements OnInit {
    static pageTitle: string = 'Import';
    static pageIcon: string = 'fa-cloud-upload';
    errorMessage: string;
    @Input() datasets: Array<IDataSet>;
    selectedDataset: IDataSet;
    selectedFile: any;
    documents = new Array<any>();
    importReady = true;
    percent: number = 0;
    tagImport = false;
    csvSettings: any = {
        delimiter: '',
        force: true
    };

    constructor(private _documentService: DocumentService,
        private _datasetService: DatasetService,
        private _tagService: TagService,
        private _notificationService: NotificationService) {
    }

    ngOnInit(): void {
        this._datasetService.getDatasets()
            .subscribe(
                datasets => {
                    this.datasets = datasets;
                    if (this.datasets) {
                        this.selectedDataset = this.datasets.find((d: IDataSet) => { return d.Name === 'agro'; });
                    }
                    // this.cdRef.detectChanges();
                    console.log('loaded');
            },
            error => this.handleError(error));

    }

    onFileSelectionChange(event: any) {
        let files = event.srcElement.files;
        if (files) {
            this.selectedFile = files[0];
        }
    }

    read(): void {
        if (this.selectedFile.name.endsWith('.csv')) {
            this.readCSV().subscribe(x => console.log(x));
        } else {
            this.readJson().subscribe(x => console.log(x));
        }
    }

    readJson(): Observable<any> {
        this.importReady = false;
        this.percent = 0;
        let observableResult = Observable.create((observer: Observer<any>) => {
            let reader = new FileReader();
            reader.onloadend = () => {
                this.percent = 50;
                observer.next(this.percent);
                let parsedData = JSON.parse(reader.result);
                if (this.tagImport) {
                    this._tagService.bulkImport(this.selectedDataset.Name, parsedData)
                        .subscribe(bulkResults => {
                            let errors = bulkResults.Results.filter(r => r.Error != null);
                            // TODO hibákat kiírni
                            this.percent = 100;
                            observer.next(this.percent);
                            this.importReady = true;
                        },
                        error => {
                            this.errorMessage = <any>error;
                            observer.next(this.percent);
                            this.importReady = true;
                        });
                } else {
                    this._documentService.bulkImport(this.selectedDataset.Name, parsedData)
                        .subscribe(bulkResults => {
                            let errors = bulkResults.Results.filter(r => r.Error != null);
                            // TODO hibákat kiírni
                            this.percent = 100;
                            observer.next(this.percent);
                            this.importReady = true;
                        },
                        error => {
                            this.errorMessage = <any>error;
                            observer.next(this.percent);
                            this.importReady = true;
                        });
                }
                this.importReady = true;
            };
            reader.readAsText(this.selectedFile, 'utf8');
        });
        return observableResult;
    }

    readCSV(): Observable<any> {
        this.importReady = false;
        this.percent = 0;
        let done = 0;
        let total: number = this.selectedFile.size;
        let chunkSize = 202400;
        let observableResult = Observable.create((observer: Observer<any>) => {
            // papa.LocalChunkSize = 1048576;
            papa.LocalChunkSize = chunkSize;
            papa.parse(this.selectedFile, {
                delimiter: this.csvSettings.delimiter,	// empty string = auto-detect
                newline: '',	// empty string = auto-detect
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                encoding: 'utf8',
                fastMode: false,
                chunk: (results, parser) => {
                    parser.pause();
                    let errorRows = [];
                    if (results.errors.length > 0) {
                        this.errorMessage += results.errors;
                        results.errors.forEach(e => {
                            errorRows.push(e.row);
                        });
                    }
                    let filteredData = results.data;
                    filteredData.splice(...errorRows);
                    if (filteredData.length > 0) {
                        if (this.tagImport) {
                            filteredData.forEach(f => {
                                try {
                                    if (f['ParentId'] && f['ParentId'].toString().toLowerCase() === 'null') {
                                        f['ParentId'] = null;
                                    }

                                } catch (error) {
                                    console.log(f['Id']);
                                }
                            });
                            this._tagService.bulkImport(this.selectedDataset.Name, filteredData)
                                .subscribe(bulkResults => {
                                    let errors = bulkResults.Results.filter(r => r.Error != null);
                                    // TODO hibákat kiírni
                                    done += chunkSize;
                                    done = done > total ? total : done;
                                    this.percent = (done / total) * 100;
                                    observer.next(this.percent);
                                    parser.resume();
                                },
                                error => {
                                    this.errorMessage = <any>error;
                                    observer.next(this.percent);
                                    parser.resume();
                                });
                        } else {
                            this._documentService.bulkImport(this.selectedDataset.Name, filteredData)
                                .subscribe(bulkResults => {
                                    let errors = bulkResults.Results.filter(r => r.Error != null);
                                    // TODO hibákat kiírni
                                    done += chunkSize;
                                    done = done > total ? total : done;
                                    this.percent = (done / total) * 100;
                                    observer.next(this.percent);
                                    parser.resume();
                                },
                                error => {
                                    this.errorMessage = <any>error;
                                    observer.next(this.percent);
                                    parser.resume();
                                });
                        }
                    }
                },
                complete: (result) => {
                    this.importReady = true;
                },
                error: (error) => {
                    this.errorMessage = error;
                }
            });
        });
        return observableResult;
    }

    handleError(response: Response) {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `Import error (${response.status})`);
    }
}
