import { Component, OnInit, Input, AfterContentInit, ViewChild, NgZone } from '@angular/core';
import { Response } from '@angular/http';

import { DialogResult } from '../models/dialog-result';
import { ConfirmDialogComponent } from '../common/components/confirm.dialog.component';
import { ConfirmModel } from '../models/confirm.model';

import { DocumentService } from '../common/services/document.service';
import { DatasetService } from '../common/services/dataset.service';
import { DatasetSelectorModel } from '../datasets/dataset-selector.model';
import { DocumentWrapper } from '../models/document-wrapper';

import { SelectedItem } from '../models/selected-item';
import { ProgressDialogModel } from '../models/progress-dialog-model';
import { DialogComponent } from '../common/components/dialog.component';
import { DatasetSelectorDialogComponent } from '../datasets/dataset-selector.dialog.component';
import { DocumentDetailsDialogComponent } from './document-details.dialog.component';
import { DocumentDetailsComponent } from './document-details.component';

import { Messenger } from '../common/services/messenger.service';
import { TagListSelectorDialogComponent } from '../common/components/taglist-selector-dialog.component';
import { IDocumentFilterSettings, IDataSet, ITag, IDocumentSampleSettings } from 'slamby-sdk-angular2';
import { Observable, Observer } from 'rxjs';

import { CommonInputDialogComponent } from '../common/components/common-input.dialog.component';


import { DocumentEditorDialogComponent } from './document-editor.dialog.component';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';

import { CommonHelper } from '../common/helpers/common.helper';


import { GridOptions, RowNode, Grid, ColDef, IDatasource, IGetRowsParams } from 'ag-grid/main';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DocDropdownCellComponent } from './doc-dropdown-cell.component';

import * as _ from 'lodash';
const naturalSort = require('node-natural-sort');

@Component({
    template: require('./documents.component.html'),
    styles: [require('./documents.component.scss')]
})
export class DocumentsComponent implements OnInit, AfterContentInit {
    static pageTitle: string = 'Documents';
    static pageIcon: string = 'fa-archive';
    cursor = 'pointer';

    _dataset: IDataSet;
    @Input()
    set dataset(dataset: IDataSet) {
        this._dataset = dataset;
        this.setFields();
        this.LoadDocuments(true);
    }
    get dataset() { return this._dataset; }
    @ViewChild(DialogComponent) dialogService: DialogComponent;
    @ViewChild(DatasetSelectorDialogComponent) datasetSelector: DatasetSelectorDialogComponent;

    @ViewChild(DocumentDetailsDialogComponent) documentDetailsDialog: DocumentDetailsDialogComponent;
    @ViewChild(CommonInputDialogComponent) inputDialog: CommonInputDialogComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog: ConfirmDialogComponent;
    @ViewChild(DocumentEditorDialogComponent) documentEditorDialog: DocumentEditorDialogComponent;
    @ViewChild(TagListSelectorDialogComponent) tagListSelectorDialog: TagListSelectorDialogComponent;

    documentDetails = DocumentDetailsComponent;

    activeTab: string = 'documents';
    isFilterOpen: boolean = true;

    errorMessage: string;
    documents: Array<any> = [];
    headers: Array<any> = [];
    selectedDocument: any;
    private _scrollId: string;
    tags: Array<ITag> = [];

    // filter and sampling
    fields: Array<SelectedItem<any>> = [];
    tagsForFilter: Array<string> = [];
    filterIsActive: boolean = true;
    filterSettings: IDocumentFilterSettings = {
        Pagination: {
            Limit: 50
        },
        Order: null,
        Filter: {
            TagIdList: null,
            Query: ''
        },
        FieldList: []
    };
    tagsForSample: Array<string> = [];
    sampleSettings = {
        Settings: {
            Id: CommonHelper.guid(),
            TagIdList: null,
            Percent: 100,
            Size: 100,
            FieldList: []
        },
        IsFix: true,
    };

    gridOptions: GridOptions;
    gridFilter: string;

    constructor(private _documentService: DocumentService,
        private _datasetService: DatasetService,
        private _messenger: Messenger,
        private _notificationService: NotificationService,
        private _zone: NgZone) {

        this._messenger.messageAvailable$.subscribe(
            m => {
                if (m.message === 'setCursor') {
                    this.cursor = m.arg;
                }
            }
        );

        this.gridOptions = <GridOptions>{};
        this.gridOptions.enableColResize = true;
        this.gridOptions.enableSorting = true;
        this.gridOptions.rowSelection = 'multiple';
        this.gridOptions.rowHeight = 28;
        this.gridOptions.suppressRowClickSelection = true;
        this.gridOptions.enableCellExpressions = true;
        this.gridOptions.context = {
            mainComponent: this
        };
    }

    sizeToFit() {
        this.gridOptions.api.sizeColumnsToFit();
    }

    autoSizeAll() {
        let allColumnIds = [];
        this.gridOptions.columnDefs.forEach((columnDef) => {
            allColumnIds.push(columnDef.field);
        });
        this.gridOptions.columnApi.autoSizeColumns(allColumnIds);
    }

    onFilterChanged(value) {
        this.gridOptions.api.setQuickFilter(value);
    }

    selectAll() {
        this.gridOptions.api.forEachNode(function (node) {
            node.setSelected(true);
        });
    }

    headerCellRendererSelectAll(params) {
        let checkBox = document.createElement('input');
        checkBox.setAttribute('type', 'checkbox');
        checkBox.setAttribute('id', 'selectAllCheckbox');

        let label = document.createElement('label');
        let title = document.createTextNode(params.colDef.headerName);
        label.appendChild(checkBox);
        label.appendChild(title);

        checkBox.addEventListener('change', (e) => {
            this.gridOptions.api.forEachNode(function (node) {
                node.setSelected((<HTMLInputElement>e.target).checked);
            });
        });

        return label;
    }

    ngAfterContentInit() {
    }

    setFields() {
        if (this.dataset.SampleDocument) {
            Object.keys(this.dataset.SampleDocument).forEach(field => {
                let selectedItem = {
                    Name: field,
                    IsSelected: this._dataset.InterpretedFields.indexOf(field) >= 0 ||
                    this._dataset.IdField === field ||
                    this._dataset.TagField === field
                };
                this.fields.push(selectedItem);
            });
        } else {
            Object.keys(this.dataset.Schema['properties']).forEach(field => {
                let selectedItem = {
                    Name: field,
                    IsSelected: this._dataset.InterpretedFields.indexOf(field) >= 0 ||
                    this._dataset.IdField === field ||
                    this._dataset.TagField === field
                };
                this.fields.push(selectedItem);
            });
        }
        this.filterSettings.FieldList = this.fields.filter(f => f.IsSelected).map(s => s.Name);
        this.sampleSettings.Settings.FieldList = this.fields.filter(f => f.IsSelected).map(s => s.Name);
    }

    tagsChanged(tags: Array<SelectedItem<ITag>>) {
        this.tags = tags.map(tsi => tsi.Item);
    }

    private LoadDocuments(setHeaders: boolean) {
        this.documents = [];
        this.showGridLoading(true);

        if (this.filterIsActive) {
            this.filterSettings.Filter.TagIdList = this.tagsForFilter.slice();
            this._documentService.getDocumentsByFilter(this.dataset.Name, null, this.filterSettings)
                .finally(() => this.showGridLoading(false))
                .subscribe(paginated => {
                    this._scrollId = paginated.ScrollId;
                    this.setGridDocuments(paginated.Items);
                },
                error => this.errorMessage = <any>error);
        } else {
            let settings: IDocumentSampleSettings = _.cloneDeep(this.sampleSettings.Settings);
            settings.Size = this.sampleSettings.IsFix ? settings.Size : 0;
            settings.Percent = this.sampleSettings.IsFix ? 0 : settings.Percent;
            settings.TagIdList = this.tagsForSample.slice();
            settings.Id = Date.now().toString();

            this.gridOptions.api.showLoadingOverlay();
            this._documentService.getDocumentsBySample(this.dataset.Name, settings)
                .finally(() => this.showGridLoading(false))
                .subscribe(paginated => {
                    this.setGridDocuments(paginated.Items);
                },
                error => this.errorMessage = <any>error);
        }
    }

    loadMore() {
        if (this.filterIsActive && this._scrollId) {
            this.showGridLoading(true);
            this._documentService.getDocumentsByFilter(this.dataset.Name, this._scrollId, null)
                .finally(() => this.showGridLoading(false))
                .subscribe(paginated => {
                    this._scrollId = paginated.ScrollId;
                    this.documents.push(...paginated.Items);
                    this.refreshGrid();
                },
                error => this.errorMessage = <any>error);
        }
    }

    showGridLoading(show: boolean) {
        if (this.gridOptions && this.gridOptions.api) {
            if (show) {
                this.gridOptions.api.showLoadingOverlay();
            } else {
                this.gridOptions.api.hideOverlay();
            }
        }
    }

    setGridDocuments(documents: any[]) {
        this.documents = documents;
        this.setHeaders();

        let colDefs = [
            <ColDef>{
                headerName: '',
                checkboxSelection: true,
                width: 80,
                minWidth: 80,
                maxWidth: 120,
                cellRenderer: (params) => params.rowIndex + 1,
                headerCellRenderer: (params) => this.headerCellRendererSelectAll(params),
                pinned: 'left',
                suppressSorting: true
            },
            <ColDef>{
                headerName: '',
                width: 135,
                minWidth: 135,
                maxWidth: 135,
                cellRendererFramework: {
                    component: DocDropdownCellComponent,
                    moduleImports: [NgbModule.forRoot()]
                },
                cellStyle: { overflow: 'visible' },
                pinned: 'left',
                suppressSorting: true
            },
            ...this.headers.map(h => <ColDef>{ headerName: h, field: h })];
        this.gridOptions.columnDefs = colDefs;
        this.gridOptions.getRowNodeId = (item: any) => item[this._dataset.IdField];
        this.gridOptions.api.setColumnDefs(colDefs);
        this.gridOptions.api.setRowData(this.documents);
    }

    ngOnInit(): void {
    }

    setHeaders() {
        this.headers = [];
        if (this.documents && this.documents.length > 0) {
            for (let key in this.documents[0]) {
                if (this.documents[0].hasOwnProperty(key)) {
                    this.headers.push(key);
                }
            }
        }
    }

    select(selected: SelectedItem<any>) {
        this.selectedDocument = JSON.stringify(selected.Item, null, 4);
    }

    getSelectedItemsCount(documents: Array<SelectedItem<any>>) {
        let selectedCount = documents ? documents.filter(t => t.IsSelected).length : 0;
        return selectedCount;
    }

    getSelectedItems(documents: Array<SelectedItem<any>>) {
        let selectedCount = documents.filter(t => t.IsSelected).length;
        return (selectedCount === documents.length || selectedCount === 0 ? 'All' : selectedCount.toString());
    }

    getSelectedIds(): any[] {
        return this.gridOptions.api.getSelectedNodes().map(node => node.id);
    }

    getSelectedDocs(): any[] {
        return this.gridOptions.api.getSelectedNodes().map(node => node.data);
    }

    setSelectedIds(ids: any[]) {
        this.gridOptions.api.forEachNode((node) => {
            if (ids.indexOf(node.data[this._dataset.IdField]) > -1) {
                node.setSelected(true);
            }
        });
    }

    getOtherDataSets(datasets: IDataSet[]): IDataSet[] {
        return datasets
            .filter(ds => ds !== this._dataset)
            .sort((a, b) => a.Name.localeCompare(b.Name));
    }

    refreshGrid() {
        let selectedIds = this.getSelectedIds();
        this.gridOptions.api.setRowData(this.documents);
        this.setSelectedIds(selectedIds);
    }

    deleteConfirm(selectedDocs: Array<any>) {
        if (!selectedDocs || selectedDocs.length === 0) {
            selectedDocs = this.getSelectedDocs();
        }
        if (this.checkArrayIsEmpty(selectedDocs)) {
            return;
        }

        let model: ConfirmModel = {
            Header: 'Delete documents',
            Message: `Are you sure to remove ${selectedDocs.length} document(s)`,
            Buttons: ['yes', 'no']
        };
        this.confirmDialog.model = model;
        this.confirmDialog.dialogClosed.subscribe(
            (result: ConfirmModel) => {
                if (result.Result === DialogResult.Yes) {
                    this.deleteDocuments(selectedDocs);
                }
            },
            error => this.handleError(error)
        );
        this.confirmDialog.open();
    }

    deleteDocuments(selectedDocs: Array<any>) {
        if (!selectedDocs || selectedDocs.length === 0) {
            return;
        }
        let dialogModel: ProgressDialogModel = {
            All: selectedDocs.length,
            ErrorCount: 0,
            Done: 0,
            Percent: 0,
            IsDone: false,
            Header: 'Deleting...'
        };
        this.dialogService.progressModel = dialogModel;
        this.dialogService.openDialog('progress');
        let sources = selectedDocs.map<Observable<any>>(currentItem => {
            return Observable.create((observer: Observer<any>) => {
                let id = currentItem[this._dataset.IdField];
                this._documentService.deleteDocument(this._dataset.Name, id)
                    .finally(() => observer.complete())
                    .subscribe(
                    () => observer.next(currentItem),
                    error => observer.error(error)
                    );
            });
        });
        let source = Observable.concat(...sources);

        source
            .finally(() => {
                this.dialogService.close();
                this.refreshGrid();
            })
            .subscribe(
            (d: SelectedItem<any>) => {
                this.documents = _.without(this.documents, d);
                dialogModel.Done += 1;
                dialogModel.Percent = (dialogModel.Done / dialogModel.All) * 100;
            },
            error => {
                this.errorMessage = <any>error;
                dialogModel.ErrorCount += 1;
                dialogModel.Done += 1;
                dialogModel.Percent = (dialogModel.Done / dialogModel.All) * 100;
            },
            () => {
                dialogModel.IsDone = true;
            }
            );
        dialogModel.IsDone = true;
    }

    checkTagFieldIsSelected(): boolean {
        let isChecked = this.fields.findIndex(f => f.Name === this._dataset.TagField && f.IsSelected) > -1;
        if (!isChecked) {
            this.confirmDialog.model = {
                Header: 'Warning!',
                Message: `To modify tag field please check the ${this._dataset.IdField} field!`,
                Buttons: ['ok']
            };
            this.confirmDialog.open();
        }
        return isChecked;
    }

    checkArrayIsEmpty(items: Array<any>): boolean {
        if (items.length <= 0) {
            this.confirmDialog.model = {
                Header: 'Warning!',
                Message: `Please select items!`,
                Buttons: ['ok']
            };
            this.confirmDialog.open();
        }
        return items.length <= 0;
    }

    clearTagsConfirm(selectedDocs: Array<any>) {
        if (!selectedDocs || selectedDocs.length === 0) {
            selectedDocs = this.getSelectedDocs();
        }
        if (!this.checkTagFieldIsSelected() || this.checkArrayIsEmpty(selectedDocs)) {
            return;
        }
        let model: ConfirmModel = {
            Header: 'Clear tags',
            Message: 'Are you sure to clear tags?',
            Buttons: ['yes', 'no']
        };
        this.confirmDialog.model = model;
        this.confirmDialog.dialogClosed.subscribe(
            (result: ConfirmModel) => {
                if (result.Result === DialogResult.Yes) {
                    this.clearTags(selectedDocs);
                }
            },
            error => this.handleError(error)
        );
        this.confirmDialog.open();
    }

    clearTags(selectedDocs: Array<any>) {
        if (!selectedDocs || selectedDocs.length === 0) {
            return;
        }
        let dialogModel: ProgressDialogModel = {
            All: selectedDocs.length,
            ErrorCount: 0,
            Done: 0,
            Percent: 0,
            IsDone: false,
            Header: 'Clear tags...'
        };
        this.dialogService.progressModel = dialogModel;
        this.dialogService.openDialog('progress');
        let sources = selectedDocs.map<Observable<any>>(currentItem => {
            return Observable.create((observer: any) => {
                let id = currentItem[this._dataset.IdField];
                let updatedDoc = {};
                updatedDoc[this._dataset.TagField] = !_.isArray(currentItem[this._dataset.TagField]) ? '' : [];
                this._documentService.updateDocument(this._dataset.Name, id, updatedDoc).subscribe(
                    updated => {
                        observer.next(updated);
                        observer.complete();
                    },
                    error => {
                        observer.error(error);
                        observer.complete();
                    }
                );
            });
        });
        let source = Observable.concat(...sources);
        source
            .finally(() => {
                dialogModel.IsDone = true;
                this.dialogService.close();
                this.refreshGrid();
            })
            .subscribe(
            document => {
                let index = this.documents.findIndex(doc => doc[this._dataset.IdField] === document[this._dataset.IdField]);
                this.documents[index].Item = document;
                this.documents = JSON.parse(JSON.stringify(this.documents)); // ??
                dialogModel.Done += 1;
                dialogModel.Percent = (dialogModel.Done / dialogModel.All) * 100;
            },
            error => {
                this.errorMessage = <any>error;
                dialogModel.ErrorCount += 1;
                dialogModel.Done += 1;
                dialogModel.Percent = (dialogModel.Done / dialogModel.All) * 100;
            });
    }

    copyAllTo() {
        this.dialogService.progressModel = { Header: 'Collectind documents...' };
        this.dialogService.openDialog('indeterminateprogress');
        let idField = this.dataset.IdField;
        let settings: IDocumentSampleSettings = _.cloneDeep(this.sampleSettings.Settings);
        settings.Size = 0;
        settings.Percent = 100;
        settings.TagIdList = this.filterIsActive
            ? this.tagsForFilter.slice()
            : this.tagsForSample.slice();
        settings.FieldList = [idField];
        this._documentService.getDocumentsBySample(this.dataset.Name, settings)
            .subscribe(paginated => {
                this.dialogService.close();
                this.copyTo(paginated.Items);
            },
            error => {
                this.errorMessage = <any>error;
                this.dialogService.close();
            });
    }

    copyTo(selectedDocs: Array<any>) {
        if (!selectedDocs || selectedDocs.length === 0) {
            selectedDocs = this.getSelectedDocs();
        }
        if (this.checkArrayIsEmpty(selectedDocs)) {
            return;
        }
        let datasetSelectorModel: DatasetSelectorModel;
        this.datasetSelector.dialogClosed.subscribe(
            (model: DatasetSelectorModel) => {
                if (model.Result !== DialogResult.Ok) {
                    return;
                }
                this.dialogService.progressModel = { Header: 'Copy documents...' };
                this.dialogService.openDialog('indeterminateprogress');
                this._documentService.copyTo(
                    this._dataset.Name,
                    model.Selected.Name,
                    selectedDocs.map<string>(doc => doc[this.dataset.IdField])
                )
                    .finally(() => this.dialogService.close())
                    .subscribe(
                    () => {
                    },
                    error => {
                    });
            },
            error => this.errorMessage = <any>error
        );
        this.datasetSelector.dialogOpened.subscribe(() => {
            this._datasetService.getDatasets().finally(() => this.datasetSelector.showProgress = false).subscribe(
                (datasets: Array<IDataSet>) => {
                    datasetSelectorModel = {
                        Datasets: this.getOtherDataSets(datasets),
                        Selected: datasets.length > 0 ? datasets[0] : null
                    };
                    this.datasetSelector.model = datasetSelectorModel;
                },
                error => this.errorMessage = <any>error
            );
        });
        this.datasetSelector.model=null;
        this.datasetSelector.showProgress = true;
        this.datasetSelector.open();
    }

    moveAllTo() {
        this.dialogService.progressModel = { Header: 'Collectind documents...' };
        this.dialogService.openDialog('indeterminateprogress');
        let idField = this.dataset.IdField;
        let settings: IDocumentSampleSettings = _.cloneDeep(this.sampleSettings.Settings);
        settings.Size = 0;
        settings.Percent = 100;
        settings.TagIdList = this.filterIsActive
            ? this.tagsForFilter.slice()
            : this.tagsForSample.slice();
        settings.FieldList = [idField];
        this._documentService.getDocumentsBySample(this.dataset.Name, settings)
            .subscribe(paginated => {
                this.dialogService.close();
                this.moveTo(paginated.Items.map<SelectedItem<any>>(d => { return { IsSelected: false, Item: d }; }));
            },
            error => {
                this.errorMessage = <any>error;
                this.dialogService.close();
            });
    }

    moveTo(selectedDocs: Array<any>) {
        if (!selectedDocs || selectedDocs.length === 0) {
            selectedDocs = this.getSelectedDocs();
        }
        if (this.checkArrayIsEmpty(selectedDocs)) {
            return;
        }
        let datasetSelectorModel: DatasetSelectorModel;
        this.datasetSelector.dialogClosed.subscribe(
            (model: DatasetSelectorModel) => {
                if (model.Result !== DialogResult.Ok) {
                    return;
                }

                this.dialogService.progressModel = { Header: 'Move documents...' };
                this.dialogService.openDialog('indeterminateprogress');
                let docIdsToMove = selectedDocs.map<string>(d => d[this.dataset.IdField]);
                this._documentService.moveTo(this._dataset.Name, model.Selected.Name, docIdsToMove)
                    .finally(() => this.dialogService.close())
                    .subscribe(
                    () => {
                        let docsToRemove = this.documents.filter(d => docIdsToMove.indexOf(d[this.dataset.IdField]) > -1);
                        this.documents = _.without(this.documents, ...docsToRemove);
                        this.refreshGrid();
                    });
            },
            error => this.errorMessage = <any>error
        );
        this.datasetSelector.dialogOpened.subscribe(() => {
            this._datasetService.getDatasets().finally(() => this.datasetSelector.showProgress = false).subscribe(
                (datasets: Array<IDataSet>) => {
                    datasetSelectorModel = {
                        Datasets: this.getOtherDataSets(datasets),
                        Selected: datasets.length > 0 ? datasets[0] : null
                    };
                    this.datasetSelector.model = datasetSelectorModel;
                },
                error => this.errorMessage = <any>error
            );
        });
        this.datasetSelector.model=null;
        this.datasetSelector.showProgress = true;
        this.datasetSelector.open();
    }

    addTags(selectedDocs: Array<any>) {
        if (!selectedDocs || selectedDocs.length === 0) {
            selectedDocs = this.getSelectedDocs();
        }
        if (!this.checkTagFieldIsSelected() || this.checkArrayIsEmpty(selectedDocs)) {
            return;
        }
        let tagFieldIsSimple = !_.isArray(selectedDocs[0][this._dataset.TagField]);
        let tagsForDocs = selectedDocs.map(d => tagFieldIsSimple ? [d[this._dataset.TagField]] : d[this._dataset.TagField]);
        let commonTags = tagsForDocs[0];
        for (let i = 1; i < tagsForDocs.length; i++) {
            commonTags = _.intersection(commonTags, tagsForDocs[i]);
        }

        this.tagListSelectorDialog.tags = this.tags;
        this.tagListSelectorDialog.isMultiselectAllowed = !tagFieldIsSimple;
        this.tagListSelectorDialog.selectedTagIds = this.tags.filter(t => commonTags.findIndex(ct => ct === t.Id) > -1).map(t => t.Id);
        this.tagListSelectorDialog.open().result.then((result) => {
            if (result !== 'OK') {
                return;
            }
            let selectedTagIds = this.tagListSelectorDialog.selectedTagIds.slice();
            if (selectedTagIds.length === 0) {
                return;
            }
            let dialogModel: ProgressDialogModel = {
                All: selectedDocs.length,
                ErrorCount: 0,
                Done: 0,
                Percent: 0,
                IsDone: false,
                Header: 'Add tags...'
            };
            this.dialogService.progressModel = dialogModel;
            this.dialogService.openDialog('progress');

            let sources = selectedDocs.map<Observable<any>>(currentItem => {
                return Observable.create((observer: Observer<any>) => {
                    let id = currentItem[this._dataset.IdField];
                    let updatedDoc = {};
                    updatedDoc[this._dataset.TagField] = tagFieldIsSimple
                        ? selectedTagIds[0]
                        : _.union(currentItem[this._dataset.TagField].map(tid => tid.toString()), selectedTagIds);
                    this._documentService.updateDocument(this._dataset.Name, id, updatedDoc).subscribe(
                        updated => {
                            observer.next(updated);
                            observer.complete();
                        },
                        error => {
                            observer.error(error);
                            observer.complete();
                        },
                        () => {
                            observer.complete();
                        }
                    );
                });
            });
            let source = Observable.concat(...sources);
            source
                .finally(() => {
                    this.dialogService.close();
                    this.refreshGrid();
                })
                .subscribe(
                document => {
                    let index = this.documents.findIndex(doc => doc[this._dataset.IdField] === document[this._dataset.IdField]);
                    this.documents[index] = document;
                    this.documents = _.cloneDeep(this.documents);
                    dialogModel.Done += 1;
                    dialogModel.Percent = (dialogModel.Done / dialogModel.All) * 100;
                },
                error => {
                    this.errorMessage = <any>error;
                    dialogModel.ErrorCount += 1;
                    dialogModel.Done += 1;
                    dialogModel.Percent = (dialogModel.Done / dialogModel.All) * 100;
                },
                () => {
                    dialogModel.IsDone = true;
                }
                );
        }, (reason) => {
        });
    }

    removeTags(selectedDocs: Array<any>) {
        if (!selectedDocs || selectedDocs.length === 0) {
            selectedDocs = this.getSelectedDocs();
        }
        if (!this.checkTagFieldIsSelected() || this.checkArrayIsEmpty(selectedDocs)) {
            return;
        }
        let tagFieldIsSimple = !_.isArray(selectedDocs[0][this._dataset.TagField]);
        let tagsForDocs = selectedDocs.map(d => tagFieldIsSimple ? [d[this._dataset.TagField]] : d[this._dataset.TagField]);
        let commonTags = tagsForDocs[0];
        for (let i = 1; i < tagsForDocs.length; i++) {
            commonTags = _.intersection(commonTags, tagsForDocs[i]);
        }
        let selectableTags = commonTags.length > 0 ? this.tags.filter(t => commonTags.findIndex(c => c.toString() === t.Id) > -1) : [];
        // if the tag missing from database
        if (commonTags.length > selectableTags.length) {
            let difference = _.difference(commonTags, selectableTags.map(t => t.Id));
            selectableTags.push(...difference.map(tid => {
                let sm = {
                    IsSelected: false,
                    Id: tid,
                    Name: tid,
                    Item: <ITag>{
                        Id: tid,
                        Name: '',
                    }
                };
                return sm;
            }));
        }

        this.tagListSelectorDialog.tags = selectableTags;
        this.tagListSelectorDialog.isMultiselectAllowed = true;
        this.tagListSelectorDialog.selectedTagIds = [];
        this.tagListSelectorDialog.open().result.then((result) => {
            if (result !== 'OK') {
                return;
            }
            let selectedTagIds = this.tagListSelectorDialog.selectedTagIds.slice();
            if (selectedTagIds.length === 0) {
                return;
            }
            let dialogModel: ProgressDialogModel = {
                All: selectedDocs.length,
                ErrorCount: 0,
                Done: 0,
                Percent: 0,
                IsDone: false,
                Header: 'Remove tags...'
            };
            this.dialogService.progressModel = dialogModel;
            this.dialogService.openDialog('progress');

            let sources = selectedDocs.map<Observable<SelectedItem<any>>>(currentItem => {
                return Observable.create((observer: Observer<any>) => {
                    let id = currentItem[this._dataset.IdField];
                    let updatedDoc = {};
                    updatedDoc[this._dataset.TagField] = tagFieldIsSimple
                        ? ''
                        : _.without(currentItem[this._dataset.TagField], ...selectedTagIds);
                    this._documentService.updateDocument(this._dataset.Name, id, updatedDoc).subscribe(
                        updated => {
                            observer.next(updated);
                            observer.complete();
                        },
                        error => {
                            observer.error(error);
                            observer.complete();
                        },
                        () => {
                            observer.complete();
                        }
                    );
                });
            });
            let source = Observable.concat(...sources);
            source
                .finally(() => {
                    this.dialogService.close();
                    this.refreshGrid();
                })
                .subscribe(
                d => {
                    let index = this.documents.findIndex(doc => doc[this._dataset.IdField] === d[this._dataset.IdField]);
                    this.documents[index] = d;
                    this.documents = _.cloneDeep(this.documents);
                    dialogModel.Done += 1;
                    dialogModel.Percent = (dialogModel.Done / dialogModel.All) * 100;
                },
                error => {
                    this.errorMessage = <any>error;
                    dialogModel.ErrorCount += 1;
                    dialogModel.Done += 1;
                    dialogModel.Percent = (dialogModel.Done / dialogModel.All) * 100;
                },
                () => {
                    dialogModel.IsDone = true;
                }
                );
        }, (reason) => {
        });
    }

    preview(document: any) {
        this.documentDetailsDialog.document = document;
        this.documentDetailsDialog.open();
    }

    openDocument(document: any) {
        this.cursor = 'progress';
        let type = this.documentDetails;
        let title = document[this._dataset.IdField];
        this._messenger.sendMessage({ message: 'addTab', arg: { type: type, title: title, parameter: document } });
    }

    saveOrEditDocument(document: any) {
        this.documentEditorDialog.model = this.getDocumentWrapper(document, this._dataset.SampleDocument);
        this.documentEditorDialog.dataSetName = this.dataset.Name;
        this.documentEditorDialog.open().result
            .then(
            (result) => {
                let resultDoc = this.documentEditorDialog.model.Document;
                if (this.documentEditorDialog.model.IsNew) {
                    this.documents.push(resultDoc);
                } else {
                    let idField = this._dataset.IdField;
                    let index = this.documents.findIndex(doc => doc[idField] === resultDoc[idField]);
                    this.documents[index] = resultDoc;
                }

                this.refreshGrid();
            },
            (reason) => { });
    }

    checkField(e, field?: SelectedItem<any>) {
        if (field) {
            this.fields[this.fields.indexOf(field)].IsSelected = e.target.checked;
        } else {
            this.fields.forEach(t => {
                t.IsSelected = e.target.checked;
            });
        }
    }

    fieldFilter() {
        this.filterSettings.FieldList = _.union(this.fields.filter(f => f.IsSelected).map(s => s.Name), [this._dataset.IdField]);
        this.sampleSettings.Settings.FieldList = _.union(this.fields.filter(f => f.IsSelected).map(s => s.Name), [this._dataset.IdField]);
        this._scrollId = null;
        this.LoadDocuments(true);
    }

    filter() {
        this.filterIsActive = true;
        this.LoadDocuments(false);
    }

    getSample() {
        this._scrollId = null;
        this.filterIsActive = false;
        this.LoadDocuments(false);
    }

    getDocumentWrapper(document: any, sampleDocument: any): DocumentWrapper {
        return <DocumentWrapper>{
            Document: (document ? document : sampleDocument) || {},
            IsNew: !document,
            Id: document ? document[this._dataset.IdField] : '',
            Header: document ? 'Edit document' : 'Add new document'
        };
    }

    selectFilterTags() {
        this.tagListSelectorDialog.tags = this.tags;
        this.tagListSelectorDialog.selectedTagIds = this.tagsForFilter.slice();
        this.tagListSelectorDialog.isMultiselectAllowed = true;
        this.tagListSelectorDialog.open().result.then((result) => {
            if (result === 'OK') {
                this.tagsForFilter = this.tagListSelectorDialog.selectedTagIds.slice();
            }
        }, (reason) => {
        });
    }

    selectSampleTags() {
        this.tagListSelectorDialog.tags = this.tags;
        this.tagListSelectorDialog.selectedTagIds = this.tagsForSample.slice();
        this.tagListSelectorDialog.isMultiselectAllowed = true;
        this.tagListSelectorDialog.open().result.then((result) => {
            if (result === 'OK') {
                this.tagsForSample = this.tagListSelectorDialog.selectedTagIds.slice();
            }
        }, (reason) => {
        });
    }

    invoke(command: string, data: any) {
        switch (command) {
            case 'preview':
                this.preview(data);
                break;
            case 'openDocument':
                this.openDocument(data);
                break;
            case 'editDocument':
                this.saveOrEditDocument(data);
                break;
            case 'copyTo':
                this.copyTo([data]);
                break;
            case 'moveTo':
                this.moveTo([data]);
                break;
            case 'addTags':
                this.addTags([data]);
                break;
            case 'removeTags':
                this.removeTags([data]);
                break;
            case 'clearTags':
                this.clearTags([data]);
                break;
            case 'deleteDocuments':
                this.deleteConfirm([data]);
                break;
        }
    }

    onTagDeleted(id: string) {
        this.removeFromArray(this.tagsForFilter, id);
        this.removeFromArray(this.tagsForSample, id);
    }

    removeFromArray(arr: string[], el: string) {
        let index = arr.indexOf(el);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }

    handleError(response: Response): string {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `DataSet error (${response.status})`);
        return errors;
    }
}
