import { OptionService } from './../common/services/option.service';
import { Component, AfterContentInit, Input, Injectable, ViewChild } from '@angular/core';
import { Response } from '@angular/http';
import { Observable, Observer, Subscription } from 'rxjs';

import { DocumentService } from '../common/services/document.service';
import { DatasetService } from '../common/services/dataset.service';
import { TagService } from '../common/services/tag.service';

import { IDataSet, IBulkResults, IBulkResult } from 'slamby-sdk-angular2';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';
import { CommonOutputDialogComponent } from '../common/components/common-output.dialog.component';
import { CommonOutputModel } from '../models/common-output.model';
import { ConfirmDialogComponent } from '../common/components/confirm.dialog.component';
import { ConfirmModel } from '../models/confirm.model';
import { GridOptions, ColDef } from 'ag-grid/main';

import * as _ from 'lodash';
let papa = require('papaparse');

class ImportStatus {
    inProgress: boolean = false;
    finished: boolean = false;
    errorMessages: Array<any> = [];
    parseErrorMessages: Array<any> = [];
    importedCount: number = 0;
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
    importType: string = 'documents';
    csvSettings: any = {
        delimiter: '',
        lineEnding: ''
    };

    @ViewChild(CommonOutputDialogComponent) dialog: CommonOutputDialogComponent;
    @ViewChild(ConfirmDialogComponent) helperDialog: ConfirmDialogComponent;

    private _importSubscription: Subscription;
    private _actionSubscription: Subscription;
    private _reader;
    private _isCancelled;
    private _maximumCharactersWithoutStep = 2000000;
    private _abortedLength = 0;
    status: ImportStatus = new ImportStatus();

    gridOptions: GridOptions;
    maximumElementInGrid = 5000;

    constructor(private _documentService: DocumentService,
        private _datasetService: DatasetService,
        private _tagService: TagService,
        private _optionService: OptionService,
        private _notificationService: NotificationService) {
        this.bulkSize = this._optionService.currentEndpoint.BulkSize;

        this.gridOptions = <GridOptions>{
            rowHeight : 28,
            context : { mainComponent: this },
            onRowDoubleClicked : this.onRowDoubleClicked
        };
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

    tagImport() {
            return this.importType === 'tags';
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
        if (this._reader) {
            this._reader.abort();
        }
        this._isCancelled = true;
    }

    import(): void {
        this._isCancelled = false;
        this.clearGrid();
        this.status = new ImportStatus();
        this.status.inProgress = true;
        this.status.finished = false;
        this.status.importedCount = 0;
        this.status.errorMessages = [];
        this.status.parseErrorMessages = [];
        if (this.isCsvFile(this.selectedFile.name)) {
            this._actionSubscription = this.importCsv().subscribe();
        } else {
            this._actionSubscription = this.importJson().subscribe();
        }
    }

    clearGrid() {
        this.gridOptions.columnDefs = [];
        this.gridOptions.api.setColumnDefs([]);
        this.gridOptions.api.setRowData([]);
    }

    setGridErrors() {
        let colDefs =
            [
                <ColDef>{ headerName: 'Id', field: 'id' },
                <ColDef>{ headerName: 'Error Message', field: 'message' }
            ];
        this.gridOptions.columnDefs = colDefs;
        this.gridOptions.api.setColumnDefs(colDefs);
        this.gridOptions.api.setRowData(this.status.errorMessages.slice(0, this.maximumElementInGrid));
        this.gridOptions.api.sizeColumnsToFit();
    }

    setGridParseErrors() {
        let colDefs = [
            <ColDef> { headerName: 'Row', field: 'row' },
            <ColDef> { headerName: 'Error Message', field: 'error.message' },
            <ColDef> { headerName: 'Parsed Object', field: 'obj' }
        ];
        this.gridOptions.columnDefs = colDefs;
        this.gridOptions.api.setColumnDefs(colDefs);
        this.gridOptions.api.setRowData(this.status.parseErrorMessages.slice(0, this.maximumElementInGrid));
        this.gridOptions.api.sizeColumnsToFit();
    }

    onRowDoubleClicked(event) {
        let model: CommonOutputModel = {
            Header: `Error details`,
            OutputObject: event.data
        };
        event.context.mainComponent.dialog.model = model;
        event.context.mainComponent.dialog.open();
    }

    importJson(): Observable<number> {
        let observableResult = Observable.create((observer: Observer<number>) => {
            this._reader = new FileReader();
            this._reader.onloadend = () => {
                try {
                    let parsedData = JSON.parse(this._reader.result);
                    this.bulkImport(parsedData)
                            .finally(() => {
                                this.status.finished = true;
                                this.status.inProgress = false;
                            })
                            .subscribe(
                            (bulkResults: IBulkResults) => {
                                this.addBulkResults(bulkResults.Results);
                            },
                            error => {
                                let errorsModel = ErrorsModelHelper.getFromResponse(error);
                                this.status.errorMessages = this.status.errorMessages.concat(
                                                errorsModel.Errors.map<any>(r => new Object({id: null, message: r}))
                                            );
                            });
                } catch (error) {
                    this.status.errorMessages = [error.toString()];
                    this.status.inProgress = false;
                    this.status.finished = true;
                }
            };
            this._reader.readAsText(this.selectedFile, 'utf-8');
        });
        this._reader = null;
        return observableResult;
    }

    importCsv(): Observable<number> {
        let pendingItems = [];
        let rowCount = 1; // because of the header
        papa.LocalChunkSize = 1024 * 1024 * 3;	// 3 MB
        papa.RemoteChunkSize = 1024 * 1024 * 3;	// 3 MB
        let observableResult = Observable.create((observer: Observer<number>) => {
            papa.parse(this.selectedFile, {
                delimiter: this.csvSettings.delimiter,	// empty string = auto-detect
                newline: this.csvSettings.lineEnding,	// empty string = auto-detect
                header: true,
                dynamicTyping: false,
                skipEmptyLines: false,
                encoding: 'utf-8',
                fastMode: false,
                quotes: true,
                chunk: (results, parser) => {
                    if (results.data.length > 0) { return; }
                    let length = parser.streamer._partialLine.length;
                    if (length > this._maximumCharactersWithoutStep) {
                        this._abortedLength = length;
                        parser.abort();
                        return;
                    }
                },
                step: (results, parser) => {
                    rowCount++;
                    if (this._isCancelled) {
                        parser.abort();
                        return;
                    }
                    if (!results || !results.data || !results.data.length) {
                        return;
                    }
                    if (results.errors.length > 0) {
                        let keys = Object.keys(results.data[0]);
                        if (keys.length === 1 && !results.data[0][keys[0]]) {
                            return;
                        }
                        this.status.parseErrorMessages = this.status.parseErrorMessages.concat(
                                            results.errors.map(e => new Object ({row: rowCount, error: e, obj: results.data[0]}))
                                        );
                        return;
                    }
                    pendingItems.push(results.data[0]);
                    if (this.tagImport() || pendingItems.length < this.bulkSize) { return; }
                    parser.pause();
                    this.bulkImport(pendingItems)
                        .finally(() => {
                            parser.resume();
                        })
                        .subscribe(
                            (bulkResults: IBulkResults) => {
                                this.addBulkResults(bulkResults.Results);
                            },
                            error => {
                                let errorsModel = ErrorsModelHelper.getFromResponse(error);
                                this.status.errorMessages = this.status.errorMessages.concat(
                                            errorsModel.Errors.map<any>(r => new Object({id: null, message: r}))
                                        );
                        });
                    pendingItems = [];
                },
                complete: (result) => {
                    if ( result && result.meta.aborted && this._abortedLength ) {
                        this.status.parseErrorMessages.push(new Object({
                                row: 0,
                                error: new Object({ message: `There wasn't any parsed object in ${this._abortedLength} characters`}),
                                obj: null
                            })
                        );
                        this.showNoStep(this._abortedLength);
                        this._abortedLength = 0;
                        this.status.finished = true;
                        this.status.inProgress = false;
                        return;
                    }
                    if (!pendingItems.length) {  }
                    if (pendingItems.length) {
                        this.bulkImport(pendingItems)
                            .finally(() => {
                                this.status.finished = true;
                                this.status.inProgress = false;
                            })
                            .subscribe(
                            (bulkResults: IBulkResults) => {
                                this.addBulkResults(bulkResults.Results);
                            },
                            error => {
                                let errorsModel = ErrorsModelHelper.getFromResponse(error);
                                this.status.errorMessages = this.status.errorMessages.concat(
                                                errorsModel.Errors.map<any>(r => new Object({id: null, message: r}))
                                            );
                            });
                        pendingItems = [];
                    } else {
                        this.status.finished = true;
                        this.status.inProgress = false;
                    }
                },
                error: (error) => {
                    this.status.errorMessages.push(new Object({id: null, message: error}));
                    this.status.finished = true;
                    this.status.inProgress = false;
                }
            });
        });
        return observableResult;
    }

    bulkImport(pendingItems: Array<any>): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            if (this.tagImport()) {
                this._tagService.bulkImport(this.selectedDataset.Name, pendingItems)
                    .finally(() => observer.complete())
                    .subscribe(
                        (bulkResults: IBulkResults) => observer.next(bulkResults),
                    error => observer.error(error));
            } else {
                this._documentService.bulkImport(this.selectedDataset.Name, pendingItems)
                    .finally(() => observer.complete())
                    .subscribe(
                        (bulkResults: IBulkResults) => observer.next(bulkResults),
                    error => observer.error(error));
            }
        });
    }

    addBulkResults(results: IBulkResult[]) {
        this.status.errorMessages = this.status.errorMessages.concat(
            results.filter(r => r.StatusCode !== 200)
                .map(r => new Object({id: r.Id, message: r.Error})));
            this.status.importedCount += results.filter(r => r.StatusCode === 200).length;
    }

    handleError(response: Response) {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `Import error (${response.status})`);
    }

    showHelp() {
        let model: ConfirmModel = {
            Header: 'Import Help',
            Message:
                `
                    <h4>Tags</h4>
                    <p>For Tags you can use <b>both JSON or CSV</b> files. The required fields are: 'Id', 'Name', 'ParentId'</p>
                    <h4>Documents</h4>
                    <p>For Documents you can <b>only use CSV</b> files. The required fields are the same that you declared with the 
                    sample document or the schema during the Dataset creation.</p>
                    <h4>General CSV requirements</h4>
                    <ul>
                        <li>all the fields must be quoted with <b>"</b> (double quotes) character</li>
                        <li>must be a header row (with the field names)</li>
                        <li>you have to <b>escape</b> the <b>"</b> character by double it: <b>""</b></li>
                        <li>it's important to choose the right <b>line endings</b></li>
                        <li>give the correct <b>delimiter character</v></li>
                        <li>the encoding must be <b>UTF-8</b></li>
                    </ul>
                `,
            Buttons: ['ok']
        };
        this.helperDialog.model = model;
        this.helperDialog.open();
    }

    showNoStep(length) {
        let model: ConfirmModel = {
            Header: 'Import Error',
            Message:
                `
                    <b>There wasn't any parsed object in ${length} characters</b><br/>
                    <p>Please try to <b>set the line ending and delimiter</b> parameters manually and try again.</p>
                    <p>If you get the same error message after you set the parameters, then probably your
                        line endings are not consistent.</p>
                `,
            Buttons: ['ok']
        };
        this.helperDialog.model = model;
        this.helperDialog.open();
    }
}
