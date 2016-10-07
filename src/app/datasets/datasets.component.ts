import { Component, OnInit, AfterContentInit } from '@angular/core';
import { Response } from '@angular/http';
import { Messenger } from '../common/services/messenger.service';

import { IDataSet } from 'slamby-sdk-angular2';
import { DataSetWrapper } from '../models/dataset-wrapper';
import { DatasetService } from '../common/services/dataset.service';
import { DocumentsComponent } from '../documents/documents.component';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';

import * as _ from 'lodash';

@Component({
    template: require('./datasets.component.html'),
    styles: [require('./datasets.component.scss')]
})
export class DatasetsComponent implements OnInit, AfterContentInit {
    static pageTitle: string = 'Datasets';
    static pageIcon: string = 'fa-database';

    dataSets: IDataSet[];
    selectedDataSet: IDataSet;
    docComponent = DocumentsComponent;
    newDataSetFormIsCollapsed = true;
    newDataSet: DataSetWrapper = this.getDefaultDataSet();

    constructor(private _datasetService: DatasetService,
        private messenger: Messenger,
        private _notificationService: NotificationService) {
    }

    ngAfterContentInit() {
        this._datasetService
            .getDatasets()
            .subscribe(
            (dataSets: Array<IDataSet>) => this.dataSets = dataSets,
            error => this.handleError(error));
    }
    ngOnInit(): void {
    }

    sampleOrSchema = (dataSet: IDataSet): any => !dataSet ? {} : dataSet.SampleDocument ? dataSet.SampleDocument : dataSet.Schema;
    selectedDataSetJson = (): string => JSON.stringify(this.sampleOrSchema(this.selectedDataSet), null, 4);

    gotoDocuments(selected: IDataSet) {
        let type = this.docComponent;
        let title = `${selected.Name} - Documents`;
        let parameter = selected;
        this.messenger.sendMessage({ message: 'addTab', arg: { type: type, title: title, parameter: parameter } });
    }

    save() {
        let dataSetToSave: IDataSet = _.cloneDeep(this.newDataSet.dataSet);
        if (this.newDataSet.IsNew) {
            dataSetToSave.InterpretedFields = dataSetToSave.InterpretedFields.toString().split(',');
            if (this.newDataSet.sampleDocumentChecked) {
                dataSetToSave.SampleDocument = JSON.parse(this.newDataSet.dataSet.SampleDocument);
                dataSetToSave.Schema = null;
                this._datasetService.createDatasetWithSampleDocument(dataSetToSave).subscribe(
                    error => this.handleError(error),
                    () => {
                        dataSetToSave.Statistics = { DocumentsCount: 0 };
                        this.dataSets = _.concat(this.dataSets, [_.cloneDeep(dataSetToSave)]);
                        this.newDataSetFormIsCollapsed = true;
                        this.newDataSet = this.getDefaultDataSet();
                    });
            } else {
                dataSetToSave.Schema = JSON.parse(this.newDataSet.dataSet.Schema);
                dataSetToSave.SampleDocument = null;
                this._datasetService.createDatasetWithSchema(dataSetToSave).subscribe(
                    error => this.handleError(error),
                    () => {
                        this.dataSets = _.concat(this.dataSets, [_.cloneDeep(this.newDataSet.dataSet)]);
                        this.newDataSetFormIsCollapsed = true;
                        this.newDataSet = this.getDefaultDataSet();
                    });
            }
        } else {
            this._datasetService.renameDataset(this.newDataSet.Name.toString(), dataSetToSave.Name).subscribe(
                error => this.handleError(error),
                () => {
                    let index = this.dataSets.indexOf(this.dataSets.find(d => d.Name === this.newDataSet.Name));
                    this.dataSets[index].Name = this.newDataSet.dataSet.Name;
                    this.newDataSetFormIsCollapsed = true;
                    this.newDataSet = this.getDefaultDataSet();
                });
        }
    }

    select(selected: IDataSet) {
        this.selectedDataSet = selected;
    }

    deleteDataSet(selected: IDataSet) {
        this._datasetService
            .deleteDataset(selected.Name)
            .subscribe(
            error => this.handleError(error),
            () => {
                this.dataSets = _.without(this.dataSets, selected);
            });
    }

    renameDataSet(selected: IDataSet) {
        this.newDataSet.dataSet = _.cloneDeep(selected);
        this.newDataSet.Name = selected.Name;
        this.newDataSet.IsNew = false;
        this.newDataSetFormIsCollapsed = false;
    }

    cloneDataSet(selected: IDataSet) {
        this.newDataSet.dataSet = _.cloneDeep(selected);
        this.newDataSet.sampleDocumentChecked = selected.SampleDocument != null;
        if (this.newDataSet.sampleDocumentChecked) {
            this.newDataSet.dataSet.SampleDocument = JSON.stringify(selected.SampleDocument, null, 4);
            this.newDataSet.dataSet.Schema = this.getDefaultDataSet().dataSet.Schema;
        } else {
            this.newDataSet.dataSet.Schema = JSON.stringify(selected.Schema);
            this.newDataSet.dataSet.SampleDocument = this.getDefaultDataSet().dataSet.SampleDocument;
        }
        this.newDataSet.dataSet.Name = '';
        this.newDataSetFormIsCollapsed = false;
    }

    getDefaultDataSet(): DataSetWrapper {
        return {
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

    handleError(response: Response) {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `DataSet error (${response.status})`);
    }
}
