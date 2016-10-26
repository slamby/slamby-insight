import { Component, OnInit, AfterContentInit, ViewChild } from '@angular/core';
import { Response } from '@angular/http';
import { Messenger } from '../common/services/messenger.service';

import { IDataSet } from 'slamby-sdk-angular2';
import { DataSetWrapper } from '../models/dataset-wrapper';
import { DatasetService } from '../common/services/dataset.service';
import { DocumentsComponent } from '../documents/documents.component';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';
import { ConfirmDialogComponent } from '../common/components/confirm.dialog.component';
import { ConfirmModel } from '../models/confirm.model';
import { DialogResult } from '../models/dialog-result';
import { DatasetEditorDialogComponent } from './dataset-editor.dialog.component';
import { JsonEditorDialogComponent } from './../common/components/json-editor-dialog.component';

import * as _ from 'lodash';

@Component({
    template: require('./datasets.component.html'),
    styles: [require('./datasets.component.scss')]
})
export class DatasetsComponent implements OnInit, AfterContentInit {
    static pageTitle: string = 'Datasets';
    static pageIcon: string = 'fa-database';
    cursor = 'pointer';
    @ViewChild(ConfirmDialogComponent) confirmDialog: ConfirmDialogComponent;
    @ViewChild(DatasetEditorDialogComponent) editorDialog: DatasetEditorDialogComponent;
    @ViewChild(JsonEditorDialogComponent) jsonEditorDialog: JsonEditorDialogComponent;

    dataSets: IDataSet[];
    docComponent = DocumentsComponent;
    isLoading = true;

    constructor(private _datasetService: DatasetService,
        private messenger: Messenger,
        private _notificationService: NotificationService) {
        this.messenger.messageAvailable$.subscribe(
            m => {
                if (m.message === 'setCursor') {
                    this.cursor = m.arg;
                }
            }
        );
    }

    ngAfterContentInit() {
        this._datasetService
            .getDatasets()
            .subscribe(
            (dataSets: Array<IDataSet>) => {
                this.dataSets = dataSets;
                this.isLoading = false;
            },
            error => {
                this.handleError(error);
                this.isLoading = false;
            });
    }

    ngOnInit(): void {
    }

    gotoDocuments(selected: IDataSet) {
        this.cursor = 'progress';
        let type = this.docComponent;
        let title = `${selected.Name} - Documents`;
        let parameter = selected;
        this.messenger.sendMessage({ message: 'addTab', arg: { type: type, title: title, parameter: parameter } });
    }

    addOrEdit(selected?: IDataSet) {
        let pendingDataset: DataSetWrapper;
        if (selected) {
            if (selected.Name) {
                pendingDataset = {
                    Header: 'Rename Dataset',
                    dataSet: _.cloneDeep(selected),
                    sampleDocumentChecked: selected.SampleDocument ? true : false,
                    IsNew: false,
                    Name: selected.Name
                };
            } else {
                pendingDataset = {
                    Header: 'Add New Dataset',
                    dataSet: _.cloneDeep(selected),
                    sampleDocumentChecked: selected.Schema == null,
                    IsNew: true,
                    Name: ''
                };
                if (selected.SampleDocument) {
                    pendingDataset.dataSet.SampleDocument = JSON.stringify(selected.SampleDocument, null, 4);
                    pendingDataset.dataSet.Schema = this.getDefaultDataSet().dataSet.Schema;
                } else {
                    pendingDataset.dataSet.Schema = JSON.stringify(selected.Schema);
                    pendingDataset.dataSet.SampleDocument = this.getDefaultDataSet().dataSet.SampleDocument;
                }
            }
        } else {
            pendingDataset = this.getDefaultDataSet();
        }

        this.editorDialog.model = pendingDataset;
        this.editorDialog.modalOptions.windowClass = !pendingDataset.IsNew ? 'md-dialog' : '';
        this.editorDialog.dialogClosed.subscribe(
            (model: DataSetWrapper) => {
                if (model.Result === DialogResult.Ok) {
                    let dataSetToSave = _.cloneDeep(model.dataSet);
                    if (model.IsNew) {
                        dataSetToSave.InterpretedFields = dataSetToSave.InterpretedFields.toString().split(',');
                        if (model.sampleDocumentChecked) {
                            dataSetToSave.SampleDocument = JSON.parse(model.dataSet.SampleDocument);
                            dataSetToSave.Schema = null;
                            this._datasetService.createDatasetWithSampleDocument(dataSetToSave).subscribe(
                                () => {
                                    dataSetToSave.Statistics = { DocumentsCount: 0 };
                                    this.dataSets = _.concat(this.dataSets, [_.cloneDeep(dataSetToSave)]);
                                    this.editorDialog.unsubscribeAndClose();
                                },
                                error => {
                                    let errors = this.handleError(error);
                                    model.ErrorMessage = errors;
                                    this.editorDialog.showProgress = false;
                                });
                        } else {
                            dataSetToSave.Schema = JSON.parse(model.dataSet.Schema);
                            dataSetToSave.SampleDocument = null;
                            this._datasetService.createDatasetWithSchema(dataSetToSave).subscribe(
                                () => {
                                    this.dataSets = _.concat(this.dataSets, [_.cloneDeep(dataSetToSave)]);
                                    this.editorDialog.unsubscribeAndClose();
                                },
                                error => {
                                    let errors = this.handleError(error);
                                    model.ErrorMessage = errors;
                                    this.editorDialog.showProgress = false;
                                });
                        }
                    } else {
                        this._datasetService.renameDataset(model.Name.toString(), dataSetToSave.Name).subscribe(
                            () => {
                                let index = this.dataSets.indexOf(this.dataSets.find(d => d.Name === model.Name));
                                this.dataSets[index].Name = model.dataSet.Name;
                                model = this.getDefaultDataSet();
                                this.editorDialog.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.editorDialog.showProgress = false;
                            });
                    }
                } else {
                    this.editorDialog.unsubscribeAndClose();
                }
            },
            error => this.handleError(error)
        );
        this.editorDialog.open();
    }

    deleteConfirm(selected: IDataSet) {
        let model: ConfirmModel = {
            Header: 'Delete dataset',
            Message: 'Are you sure to remove the following data set: ' + selected.Name,
            Buttons: ['yes', 'no']
        };
        this.confirmDialog.model = model;
        this.confirmDialog.modalOptions.windowClass = 'md-dialog';
        this.confirmDialog.dialogClosed.subscribe(
            (result: ConfirmModel) => {
                if (result.Result === DialogResult.Yes) {
                    this.deleteDataSet(selected, result);
                }
            }
        );
        this.confirmDialog.open();
    }

    deleteDataSet(selected: IDataSet, confirmModel: ConfirmModel) {
        this._datasetService
            .deleteDataset(selected.Name)
            .subscribe(
            () => {
                this.dataSets = _.without(this.dataSets, selected);
                this.confirmDialog.unsubscribeAndClose();
            },
            error => {
                this.handleError(error);
                this.confirmDialog.unsubscribeAndClose();
            });
    }

    cloneDataSet(selected: IDataSet) {
        let datasetToClone = _.cloneDeep(selected);
        datasetToClone.Name = '';
        this.addOrEdit(datasetToClone);
    }

    getDefaultDataSet(): DataSetWrapper {
        return {
            Header: 'Add New Dataset',
            dataSet: {
                Name: '',
                NGramCount: 3,
                IdField: 'id',
                TagField: 'tag',
                InterpretedFields: new Array<string>('title', 'desc'),
                SampleDocument: JSON.stringify(
                    {
                        id: 10,
                        title: 'thisisthetitle',
                        desc: 'thisisthedesc',
                        tag: 'tag1'
                    }, null, 4),
                Schema: JSON.stringify(
                    {
                        type: 'object',
                        properties:
                        {
                            id: { type: 'integer' },
                            title: { type: 'string' },
                            desc: { type: 'string' },
                            tag: { type: 'string' }
                        }
                    }, null, 4)
            },
            sampleDocumentChecked: true,
            IsNew: true,
            Name: ''
        };
    }

    showSampleSchemaJson(dataSet: IDataSet) {
        if (!dataSet.SampleDocument &&
            !dataSet.Schema) {
            return;
        }

        if (dataSet.SampleDocument) {
            this.jsonEditorDialog.json = this.getJsonString(dataSet.SampleDocument);
            this.jsonEditorDialog.header = 'Sample Document';
        } else if (dataSet.Schema) {
            this.jsonEditorDialog.json = this.getJsonString(dataSet.Schema);
            this.jsonEditorDialog.header = 'Schema';
        }

        this.jsonEditorDialog.open();
    }

    getJsonString(document: any): string {
        return typeof document === 'object'
            ? JSON.stringify(document, null, 4)
            : document;
    }

    handleError(response: Response): string {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `DataSet error (${response.status})`);
        return errors;
    }
}
