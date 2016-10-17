import { Component, OnInit, Input, AfterContentInit, ViewChild, NgZone } from '@angular/core';
import { Response } from '@angular/http';

import { DialogResult } from '../models/dialog-result';
import { ConfirmDialogComponent } from '../common/components/confirm.dialog.component';
import { ConfirmModel } from '../models/confirm.model';

import { DocumentService } from '../common/services/document.service';
import { DatasetService } from '../common/services/dataset.service';
import { TagService } from '../common/services/tag.service';
import { DatasetSelectorModel } from '../datasets/dataset-selector.model';
import { DocumentWrapper } from '../models/document-wrapper';
import { TagWrapper } from '../models/tag-wrapper';
import { SelectedItem } from '../models/selected-item';
import { ProgressDialogModel } from '../models/progress-dialog-model';
import { DialogComponent } from '../common/components/dialog.component';
import { DatasetSelectorDialogComponent } from '../datasets/dataset-selector.dialog.component';
import { TagSelectorDialogComponent } from './tag-selector.dialog.component';
import { DocumentDetailsDialogComponent } from './document-details.dialog.component';
import { TagSelectorModel } from './tag-selector.model';
import { DocumentDetailsComponent } from './document-details.component';
import { ProcessesComponent } from '../processes/processes.component';
import { Messenger } from '../common/services/messenger.service';
import { TagListSelectorDialogComponent } from './taglist-selector-dialog.component';
import { IDocumentFilterSettings, IDataSet, ITag, IDocumentSampleSettings, IProcess, ITagsExportWordsSettings } from 'slamby-sdk-angular2';
import { Observable, Observer } from 'rxjs';

import { CommonInputDialogComponent } from '../common/components/common-input.dialog.component';
import { CommonInputModel } from '../models/common-input.model';

import { DocumentEditorDialogComponent } from './document-editor.dialog.component';
import { TagEditorDialogComponent } from './tag-editor.dialog.component';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';

import { CommonHelper } from '../common/helpers/common.helper';

import * as _ from 'lodash';
const naturalSort = require('node-natural-sort');

@Component({
    template: require('./documents.component.html'),
    styles: [require('./documents.component.scss')]
})
export class DocumentsComponent implements OnInit, AfterContentInit {
    static pageTitle: string = 'Documents';
    static pageIcon: string = 'fa-archive';

    _dataset: IDataSet;
    @Input()
    set dataset(dataset: IDataSet) {
        this._dataset = dataset;
        this.setFields();
        this.LoadDocuments();
        this.LoadTags();
    }
    get dataset() { return this._dataset; }
    @ViewChild(DialogComponent) dialogService: DialogComponent;
    @ViewChild(DatasetSelectorDialogComponent) datasetSelector: DatasetSelectorDialogComponent;
    @ViewChild(TagSelectorDialogComponent) tagSelector: TagSelectorDialogComponent;
    @ViewChild(DocumentDetailsDialogComponent) documentDetailsDialog: DocumentDetailsDialogComponent;
    @ViewChild(CommonInputDialogComponent) inputDialog: CommonInputDialogComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog: ConfirmDialogComponent;
    @ViewChild(DocumentEditorDialogComponent) documentEditorDialog: DocumentEditorDialogComponent;
    @ViewChild(TagEditorDialogComponent) tagEditorDialog: TagEditorDialogComponent;
    @ViewChild('filterTagListSelector') tagListSelectorDialog: TagListSelectorDialogComponent;

    documentDetails = DocumentDetailsComponent;

    errorMessage: string;
    documents: Array<SelectedItem<any>> = [];
    headers: Array<any> = [];
    selectedDocument: any;
    private _scrollId: string;
    tags: Array<SelectedItem<ITag>> = [];

    // filter and sampling
    fields: Array<SelectedItem<any>> = [];
    // filterTagsIsCollapsed: boolean = true;
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
    // sampleTagsIsCollapsed: boolean = true;
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

    constructor(private _documentService: DocumentService,
        private _tagService: TagService,
        private _datasetService: DatasetService,
        private _messenger: Messenger,
        private _notificationService: NotificationService,
        private _zone: NgZone) {
    }

    ngAfterContentInit() {
    }

    setFields() {
        Object.keys(this.dataset.SampleDocument).forEach(field => {
            let selectedItem = {
                Name: field,
                IsSelected: this._dataset.InterpretedFields.indexOf(field) >= 0 || this._dataset.IdField === field
            };
            this.fields.push(selectedItem);
        });
        this.filterSettings.FieldList = this.fields.filter(f => f.IsSelected).map(s => s.Name);
        this.sampleSettings.Settings.FieldList = this.fields.filter(f => f.IsSelected).map(s => s.Name);
    }

    private LoadTags() {
        this._tagService.getTags(this._dataset.Name).subscribe(
            (tags: Array<ITag>) => {
                let comparator = naturalSort({ caseSensitive: false });
                tags = tags.sort((a: ITag, b: ITag) => comparator(a.Id, b.Id));
                this.tags = tags.map<SelectedItem<ITag>>(t => { return { IsSelected: false, Item: t }; });
            },
            error => this.errorMessage = <any>error
        );
    }

    private LoadDocuments() {
        this.documents = [];
        if (this.filterIsActive) {
            this.filterSettings.Filter.TagIdList = this.tagsForFilter.slice();
            this._documentService.getDocumentsByFilter(this.dataset.Name, null, this.filterSettings)
                .subscribe(paginated => {
                    this._scrollId = paginated.ScrollId;
                    this.documents = paginated.Items.map<SelectedItem<any>>(d => {
                        return {
                            IsSelected: false,
                            Id: d[this._dataset.IdField],
                            Item: d
                        };
                    });
                    this.setHeaders();
                },
                error => this.errorMessage = <any>error);
        } else {
            let settings: IDocumentSampleSettings = JSON.parse(JSON.stringify(this.sampleSettings.Settings));
            settings.Size = this.sampleSettings.IsFix ? settings.Size : 0;
            settings.Percent = this.sampleSettings.IsFix ? 0 : settings.Percent;
            settings.TagIdList = this.tagsForSample.slice();
            this._documentService.getDocumentsBySample(this.dataset.Name, settings)
                .subscribe(paginated => {
                    this.documents = paginated.Items.map<SelectedItem<any>>(d => {
                        return {
                            IsSelected: false,
                            Id: d[this._dataset.IdField],
                            Item: d
                        };
                    });
                    this.setHeaders();
                },
                error => this.errorMessage = <any>error);

        }
    }

    ngOnInit(): void {
    }

    setHeaders() {
        this.headers = [];
        if (this.documents && this.documents.length > 0) {
            for (let key in this.documents[0].Item) {
                if (this.documents[0].Item.hasOwnProperty(key)) {
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

    checkDocument(e, doc?: SelectedItem<any>) {
        if (doc) {
            this.documents[this.documents.indexOf(doc)].IsSelected = e.target.checked;
        } else {
            this.documents.forEach(t => {
                t.IsSelected = e.target.checked;
            });
        }
    }

    loadMore() {
        if (this.filterIsActive && this._scrollId) {
            this._documentService.getDocumentsByFilter(this.dataset.Name, this._scrollId, null)
                .subscribe(
                paginated => {
                    this._scrollId = paginated.ScrollId;
                    this.documents = _.concat(this.documents, paginated.Items.map<SelectedItem<any>>(
                        d => { return { IsSelected: false, Id: d[this._dataset.IdField], Item: d }; })
                    );
                },
                error => this.errorMessage = <any>error);
        }
    }

    deleteConfirm(selectedItems?: Array<SelectedItem<any>>) {
        let selectedDocs = selectedItems ? selectedItems : this.documents.filter(d => d.IsSelected);
        let model: ConfirmModel = {
            Header: 'Delete documents',
            Message: 'Are you sure to remove ' + selectedDocs.length + ' document(s)',
            Buttons: ['yes', 'no']
        };
        this.confirmDialog.model = model;
        this.confirmDialog.dialogClosed.subscribe(
            (result: ConfirmModel) => {
                if (result.Result === DialogResult.Yes) {
                    this.deleteDocuments(selectedItems);
                }
            },
            error => this.handleError(error)
        );
        this.confirmDialog.open();
    }

    deleteDocuments(selectedItems?: Array<SelectedItem<any>>) {
        let selectedDocs = selectedItems ? selectedItems : this.documents.filter(d => d.IsSelected);
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
        let sources = selectedDocs.map<Observable<SelectedItem<any>>>(currentItem => {
            return Observable.create((observer: Observer<SelectedItem<any>>) => {
                let id = currentItem.Item[this._dataset.IdField];
                this._documentService.deleteDocument(this._dataset.Name, id).subscribe(
                    error => {
                        observer.error(error);
                        observer.complete();
                    },
                    () => {
                        observer.next(currentItem);
                        observer.complete();
                    }
                );
            });
        });
        let source = Observable.concat(...sources);

        source.subscribe(
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

    clearTagsConfirm(selectedItems?: Array<SelectedItem<any>>) {
        if (!this.checkTagFieldIsSelected()) {
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
                    this.clearTags(selectedItems);
                }
            },
            error => this.handleError(error)
        );
        this.confirmDialog.open();
    }

    clearTags(selectedItems?: Array<SelectedItem<any>>) {
        let selectedDocs = selectedItems ? selectedItems : this.documents.filter(d => d.IsSelected);
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
        let sources = selectedDocs.map<Observable<SelectedItem<any>>>(currentItem => {
            return Observable.create((observer: Observer<any>) => {
                let id = currentItem.Item[this._dataset.IdField];
                let updatedDoc = {};
                updatedDoc[this._dataset.TagField] = !_.isArray(currentItem.Item[this._dataset.TagField]) ? '' : [];
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
        source.subscribe(
            d => {
                let index = this.documents.findIndex(doc => doc.Item[this._dataset.IdField] === d[this._dataset.IdField]);
                this.documents[index].Item = d;
                this.documents = JSON.parse(JSON.stringify(this.documents));
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
                this.copyTo(paginated.Items.map<SelectedItem<any>>(d => { return { IsSelected: false, Item: d }; }));
            },
            error => {
                this.errorMessage = <any>error;
                this.dialogService.close();
            });
    }

    copyTo(selectedItems?: Array<SelectedItem<any>>) {
        let selectedDocs = selectedItems ? selectedItems : this.documents.filter(d => d.IsSelected);
        let datasetSelectorModel: DatasetSelectorModel;
        this.datasetSelector.dialogClosed.subscribe(
            (model: DatasetSelectorModel) => {
                this.dialogService.progressModel = { Header: 'Copy documents...' };
                this.dialogService.openDialog('indeterminateprogress');
                this._documentService.copyTo(
                    this._dataset.Name,
                    model.Selected.Name,
                    selectedDocs.map<string>(d => d.Item[this.dataset.IdField]))
                    .subscribe(
                    error => {
                        this.dialogService.close();
                    },
                    () => {
                        this.dialogService.close();
                    }
                    );
            },
            error => this.errorMessage = <any>error
        );
        this._datasetService.getDatasets().subscribe(
            (datasets: Array<IDataSet>) => {
                datasetSelectorModel = {
                    Datasets: datasets,
                    Selected: datasets.length > 0 ? datasets[0] : null
                };
                this.datasetSelector.model = datasetSelectorModel;
                this.datasetSelector.open();
            },
            error => this.errorMessage = <any>error
        );
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

    moveTo(selectedItems?: Array<SelectedItem<any>>) {
        let selectedDocs = selectedItems ? selectedItems : this.documents.filter(d => d.IsSelected);
        let datasetSelectorModel: DatasetSelectorModel;
        this.datasetSelector.dialogClosed.subscribe(
            (model: DatasetSelectorModel) => {
                this.dialogService.progressModel = { Header: 'Move documents...' };
                this.dialogService.openDialog('indeterminateprogress');
                let docIdsToMove = selectedDocs.map<string>(d => d.Item[this.dataset.IdField]);
                this._documentService.moveTo(this._dataset.Name, model.Selected.Name, docIdsToMove).subscribe(
                    error => {
                        this.dialogService.close();
                    },
                    () => {
                        let docsToRemove = this.documents.filter(d => docIdsToMove.indexOf(d.Item[this.dataset.IdField]) > -1);
                        this.documents = _.without(this.documents, ...docsToRemove);
                        this.dialogService.close();
                    }
                );
            },
            error => this.errorMessage = <any>error
        );
        this._datasetService.getDatasets().subscribe(
            (datasets: Array<IDataSet>) => {
                datasetSelectorModel = {
                    Datasets: datasets,
                    Selected: datasets.length > 0 ? datasets[0] : null
                };
                this.datasetSelector.model = datasetSelectorModel;
                this.datasetSelector.open();
            },
            error => this.errorMessage = <any>error
        );
    }

    addTags(selectedItems?: Array<SelectedItem<any>>) {
        if (!this.checkTagFieldIsSelected()) {
            return;
        }
        let selectedDocs = selectedItems ? selectedItems : this.documents.filter(d => d.IsSelected);
        let tagFieldIsSimple = !_.isArray(selectedDocs[0].Item[this._dataset.TagField]);
        let tagsForDocs = selectedDocs.map(d => tagFieldIsSimple ? [d.Item[this._dataset.TagField]] : d.Item[this._dataset.TagField]);
        let commonTags = tagsForDocs[0];
        for (let i = 1; i < tagsForDocs.length; i++) {
            commonTags = _.intersection(commonTags, tagsForDocs[i]);
        }
        let tagSelectorModel: TagSelectorModel = {
            Tags: this.tags.map(t => {
                let sm = _.cloneDeep(t);
                sm.IsSelected = commonTags.indexOf(t.Item.Id) > -1;
                return sm;
            }),
            IsMultiselectAllowed: !tagFieldIsSimple
        };
        this.tagSelector.dialogClosed.subscribe(
            (model: TagSelectorModel) => {
                let selectedTagIds = model.Tags.filter(t => t.IsSelected).map(t => t.Item.Id);
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

                let sources = selectedDocs.map<Observable<SelectedItem<any>>>(currentItem => {
                    return Observable.create((observer: Observer<any>) => {
                        let id = currentItem.Item[this._dataset.IdField];
                        let updatedDoc = {};
                        updatedDoc[this._dataset.TagField] = tagFieldIsSimple
                            ? selectedTagIds[0]
                            : _.union(currentItem.Item[this._dataset.TagField], selectedTagIds);
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
                source.subscribe(
                    d => {
                        let index = this.documents.findIndex(doc => doc.Item[this._dataset.IdField] === d[this._dataset.IdField]);
                        this.documents[index].Item = d;
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
            },
            error => {
                this.errorMessage = <any>error;
            }
        );
        this.tagSelector.model = tagSelectorModel;
        this.tagSelector.open();
    }

    removeTags(selectedItems?: Array<SelectedItem<any>>) {
        if (!this.checkTagFieldIsSelected()) {
            return;
        }
        let selectedDocs = selectedItems ? selectedItems : this.documents.filter(d => d.IsSelected);
        let tagFieldIsSimple = !_.isArray(selectedDocs[0].Item[this._dataset.TagField]);
        let tagsForDocs = selectedDocs.map(d => tagFieldIsSimple ? [d.Item[this._dataset.TagField]] : d.Item[this._dataset.TagField]);
        let commonTags = tagsForDocs[0];
        for (let i = 1; i < tagsForDocs.length; i++) {
            commonTags = _.intersection(commonTags, tagsForDocs[i]);
        }
        let tagSelectorModel: TagSelectorModel = {
            Tags: commonTags.length > 0 ? this.tags.filter(t => commonTags.findIndex(c => c.toString() === t.Item.Id) > -1).map(t => {
                let sm = _.cloneDeep(t);
                sm.IsSelected = false;
                return sm;
            }) : [],
            IsMultiselectAllowed: true
        };
        // if the tag missing from database
        if (commonTags.length > tagSelectorModel.Tags.length) {
            let difference = _.difference(commonTags, tagSelectorModel.Tags.map(t => t.Item.Id));
            tagSelectorModel.Tags.push(...difference.map(tid => {
                let sm = {
                    IsSelected: false,
                    Item: <ITag>{
                        Id: tid,
                        Name: ''
                    }
                };
                return sm;
            }));
        }
        this.tagSelector.dialogClosed.subscribe(
            (model: TagSelectorModel) => {
                let selectedTagIds = model.Tags.filter(t => t.IsSelected).map(t => t.Item.Id);
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
                        let id = currentItem.Item[this._dataset.IdField];
                        let updatedDoc = {};
                        updatedDoc[this._dataset.TagField] = tagFieldIsSimple
                            ? ''
                            : _.without(currentItem.Item[this._dataset.TagField], selectedTagIds);
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
                source.subscribe(
                    d => {
                        let index = this.documents.findIndex(doc => doc.Item[this._dataset.IdField] === d[this._dataset.IdField]);
                        this.documents[index].Item = d;
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
            },
            error => {
                this.errorMessage = <any>error;
            }
        );
        this.tagSelector.model = tagSelectorModel;
        this.tagSelector.open();
    }

    preview(selected: SelectedItem<any>) {
        this.documentDetailsDialog.document = selected.Item;
        this.documentDetailsDialog.open();
    }

    openDocument(selected: SelectedItem<any>) {
        let type = this.documentDetails;
        let title = selected.Item[this._dataset.IdField];
        let parameter = selected.Item;
        this._messenger.sendMessage({ message: 'addTab', arg: { type: type, title: title, parameter: parameter } });
    }

    saveOrEditDocument(selected: SelectedItem<any>) {
        let pendingDocument;
        if (selected) {
            pendingDocument = {
                Document: JSON.stringify(selected.Item, null, 4),
                IsNew: false,
                Id: selected.Item[this._dataset.IdField],
                Header: 'Edit document'
            };
        } else {
            pendingDocument = this.getDefaultDocument(this._dataset.SampleDocument);
        }
        this.documentEditorDialog.model = pendingDocument;
        this.documentEditorDialog.dialogClosed.subscribe((model: DocumentWrapper) => {
            if (model.Result === DialogResult.Ok) {
                let docToSave = JSON.parse(model.Document);
                if (model.IsNew) {
                    this._documentService.createDocument(this.dataset.Name, docToSave).subscribe(
                        () => {
                            this.documents = _.concat(this.documents, [<SelectedItem<any>>_.cloneDeep({
                                IsSelected: false,
                                Item: docToSave
                            })]);
                            this.setHeaders();
                            this.documentEditorDialog.unsubscribeAndClose();
                        },
                        error => {
                            let errors = this.handleError(error);
                            model.ErrorMessage = errors;
                            this.documentEditorDialog.showProgress = false;
                        }
                    );
                } else {
                    this._documentService.updateDocument(this.dataset.Name, model.Id, docToSave).subscribe(
                        updatedDoc => {
                            let idField = this._dataset.IdField;
                            let index = this.documents.indexOf(this.documents.find(d => d.Item[idField] === model.Id));
                            this.documents[index].Item = updatedDoc;
                            this.documentEditorDialog.unsubscribeAndClose();
                        },
                        error => {
                            let errors = this.handleError(error);
                            model.ErrorMessage = errors;
                            this.documentEditorDialog.showProgress = false;
                        }
                    );
                }
            }
        });
        this.documentEditorDialog.open();
    }

    checkTag(e, tag?: SelectedItem<ITag>) {
        if (tag) {
            this.tags[this.tags.indexOf(tag)].IsSelected = e.target.checked;
        } else {
            this.tags.forEach(t => {
                t.IsSelected = e.target.checked;
            });
        }
    }

    deleteTagConfirm(selectedItems?: Array<SelectedItem<ITag>>) {
        let selectedTags = selectedItems ? selectedItems : this.tags.filter(d => d.IsSelected);
        let model: ConfirmModel = {
            Header: 'Delete tags',
            Message: 'Are you sure to remove ' + selectedTags.length + ' tag(s)',
            Buttons: ['yes', 'no']
        };
        this.confirmDialog.model = model;
        this.confirmDialog.dialogClosed.subscribe(
            (result: ConfirmModel) => {
                if (result.Result === DialogResult.Yes) {
                    this.deleteTag(selectedItems);
                }
            },
            error => this.handleError(error)
        );
        this.confirmDialog.open();
    }

    deleteTag(selectedItems?: Array<SelectedItem<ITag>>) {
        let selectedTags = selectedItems ? selectedItems : this.tags.filter(d => d.IsSelected);
        let dialogModel: ProgressDialogModel = {
            All: selectedTags.length,
            ErrorCount: 0,
            Done: 0,
            Percent: 0,
            IsDone: false,
            Header: 'Deleting...'
        };
        this.dialogService.progressModel = dialogModel;
        this.dialogService.openDialog('progress');
        let sources = selectedTags.map<Observable<SelectedItem<ITag>>>(currentItem => {
            return Observable.create((observer: Observer<SelectedItem<ITag>>) => {
                this._tagService.deleteTag(this._dataset.Name, currentItem.Item.Id).subscribe(
                    error => {
                        observer.error(error);
                        observer.complete();
                    },
                    () => {
                        observer.next(currentItem);
                        observer.complete();
                    }
                );
            });
        });
        let source = Observable.concat(...sources);

        source.subscribe(
            (t: SelectedItem<ITag>) => {
                this.tags = _.without(this.tags, t);
                let index = this.tagsForFilter.indexOf(t.Item.Id);
                if (index > -1) {
                    this.tagsForFilter.splice(index, 1);
                }
                index = this.tagsForSample.indexOf(t.Item.Id);
                if (index > -1) {
                    this.tagsForSample.splice(index, 1);
                }
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

    exportWords(selectedItems?: Array<SelectedItem<ITag>>) {
        let tagIdList = selectedItems ? selectedItems.map(t => t.Item.Id) : this.tags.filter(t => t.IsSelected).map(t => t.Item.Id);

        let settings: ITagsExportWordsSettings = {
            NGramList: _.range(1, this._dataset.NGramCount + 1),
            TagIdList: tagIdList
        };
        let inputModel: CommonInputModel = {
            Header: 'Export Settings',
            Model: settings
        };
        this.inputDialog.model = inputModel;
        this.inputDialog.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    this._tagService.exportWords(this._dataset.Name, model.Model).subscribe(
                        (process: IProcess) => {
                            this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                            this.inputDialog.unsubscribeAndClose();
                        },
                        error => {
                            let errors = this.handleError(error);
                            model.ErrorMessage = errors;
                            this.inputDialog.showProgress = false;
                        }
                    );

                    this._messenger.sendMessage({
                        message: 'addOrSelectTab', arg: {
                            type: ProcessesComponent,
                            title: ProcessesComponent.pageTitle,
                            parameter: {}
                        }
                    });
                }
            }
        );
        this.inputDialog.open();
    }

    saveOrEditTag(selected: SelectedItem<ITag>) {
        let pendingTag;
        if (selected) {
            pendingTag = {
                Header: 'Edit tag',
                Tag: _.cloneDeep(selected.Item),
                IsNew: false,
                Id: selected.Item.Id,
            };
        } else {
            pendingTag = this.getDefaultTag();
        }
        this.tagEditorDialog.model = pendingTag;
        this.tagEditorDialog.dialogClosed.subscribe((model: TagWrapper) => {
            if (model.Result === DialogResult.Ok) {
                let tagToSave = _.cloneDeep(model.Tag);
                if (pendingTag.IsNew) {
                    this._tagService.createTag(this.dataset.Name, tagToSave).subscribe(
                        (newTag: ITag) => {
                            this.tags = _.concat(this.tags, [{
                                IsSelected: false,
                                Item: _.cloneDeep(newTag)
                            }]);
                            this.tagEditorDialog.unsubscribeAndClose();
                        },
                        error => {
                            let errors = this.handleError(error);
                            model.ErrorMessage = errors;
                            this.tagEditorDialog.showProgress = false;
                        }
                    );
                } else {
                    this._tagService.updateTag(this.dataset.Name, pendingTag.Id, tagToSave).subscribe(
                        () => {
                            let index = this.tags.indexOf(this.tags.find(d => d.Item.Id === pendingTag.Id));
                            this.tags[index].Item = _.cloneDeep(tagToSave);
                            this.tagEditorDialog.unsubscribeAndClose();
                        },
                        error => {
                            let errors = this.handleError(error);
                            model.ErrorMessage = errors;
                            this.tagEditorDialog.showProgress = false;
                        }
                    );
                }
            }
        });
        this.tagEditorDialog.open();
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
        this.LoadDocuments();
    }

    filter() {
        this.filterIsActive = true;
        this.LoadDocuments();
    }

    getSample() {
        this._scrollId = null;
        this.filterIsActive = false;
        this.LoadDocuments();
    }

    getDefaultDocument(sampleDocument: any): any {
        return {
            Document: sampleDocument ? JSON.stringify(sampleDocument, null, 4) : JSON.stringify({}, null, 4),
            IsNew: true,
            Id: '',
            Header: 'Add new document'
        };
    }

    getDefaultTag(): TagWrapper {
        return {
            Tag: {
                Name: '',
                Id: '',
                ParentId: ''
            },
            IsNew: true,
            Id: '',
            Header: 'Edit tag',
        };
    }

    selectFilterTags() {
        this.tagListSelectorDialog.tags = this.tags.map<ITag>(t => t.Item);
        this.tagListSelectorDialog.selectedTagIds = this.tagsForFilter.slice();
        this.tagListSelectorDialog.open().result.then((result) => {
            if (result === 'OK') {
                this.tagsForFilter = this.tagListSelectorDialog.selectedTagIds.slice();
            }
        }, (reason) => {
        });
    }

    selectSampleTags() {
        this.tagListSelectorDialog.tags = this.tags.map<ITag>(t => t.Item);
        this.tagListSelectorDialog.selectedTagIds = this.tagsForSample.slice();
        this.tagListSelectorDialog.open().result.then((result) => {
            if (result === 'OK') {
                this.tagsForSample = this.tagListSelectorDialog.selectedTagIds.slice();
            }
        }, (reason) => {
        });
    }

    handleError(response: Response): string {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `DataSet error (${response.status})`);
        return errors;
    }
}
