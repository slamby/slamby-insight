import { Component, OnInit, Input, AfterContentInit, ViewChild } from '@angular/core';
import { Response } from '@angular/http';

import { DialogResult } from '../models/dialog-result';

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
import { Messenger } from '../common/services/messenger.service';
import { IDocumentFilterSettings, IDataSet, ITag, IDocumentSampleSettings, IProcess, ITagsExportWordsSettings } from 'slamby-sdk-angular2';
import { Observable, Observer } from 'rxjs';

import { CommonInputDialogComponent } from '../common/components/common-input.dialog.component';
import { CommonInputModel } from '../models/common-input.model';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';

import { CommonHelper } from '../common/helpers/common.helper';

import * as _ from 'lodash';

@Component({
    template: require('./documents.component.html'),
    styles: [require('./documents.component.scss')]
})
export class DocumentsComponent implements OnInit, AfterContentInit {
    static pageTitle: string = 'Documents';

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

    documentDetails = DocumentDetailsComponent;

    errorMessage: string;
    documents: Array<SelectedItem<any>> = [];
    headers: Array<any> = [];
    selectedDocument: any;
    private _scrollId: string;
    newDocumentFormIsCollapsed = true;
    newTagFormIsCollapsed = true;
    pendingDocument: DocumentWrapper;
    defaultDocument: DocumentWrapper;
    tags: Array<SelectedItem<ITag>> = [];
    defaultTag: TagWrapper = {
        Tag: {
            Name: '',
            Id: '',
            ParentId: ''
        },
        IsNew: true,
        Id: ''
    };
    pendingTag: TagWrapper = JSON.parse(JSON.stringify(this.defaultTag, null, 4));
    currentTags: Array<SelectedItem<ITag>> = [];
    _tagPage = 1;
    tagPageSize = 10;

    // filter and sampling
    fields: Array<SelectedItem<any>> = [];
    filterTagsIsCollapsed: boolean = true;
    tagsForFilter: Array<SelectedItem<any>> = [];
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
    sampleTagsIsCollapsed: boolean = true;
    tagsForSample: Array<SelectedItem<any>> = [];
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


    set tagPage(page: number) {
        if (this.tags != null) {
            this._tagPage = page * this.tagPageSize > this.tags.length ? page - 1 : page;
            if (this.tags.length > 0) {
                this.currentTags = this.tags.slice((page - 1) * this.tagPageSize,
                    page * this.tagPageSize > this.tags.length ? this.tags.length : page * this.tagPageSize);
            }
        } else {
            this._tagPage = 1;
        }
    }
    get tagPage() { return this._tagPage; }

    constructor(private _documentService: DocumentService,
        private _tagService: TagService,
        private _datasetService: DatasetService,
        private _messenger: Messenger,
        private _notificationService: NotificationService) {
    }

    ngAfterContentInit() {
        this.defaultDocument = {
            Document: this._dataset.SampleDocument ? JSON.stringify(this._dataset.SampleDocument, null, 4) : JSON.stringify({}, null, 4),
            IsNew: true,
            Id: ''
        };
        this.pendingDocument = JSON.parse(JSON.stringify(this.defaultDocument));
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
                this.tags = tags.map<SelectedItem<ITag>>(t => { return { IsSelected: false, Item: t }; });
                this.tagsForFilter = tags.map<SelectedItem<ITag>>(t => {
                    return {
                        Id: t.Id,
                        Name: t.Name,
                        IsSelected: false
                    };
                });
                this.tagsForSample = tags.map<SelectedItem<ITag>>(t => {
                    return {
                        Id: t.Id,
                        Name: t.Name,
                        IsSelected: false
                    };
                });
                this.tagPage = 1;
            },
            error => this.errorMessage = <any>error
        );
    }

    private LoadDocuments() {
        this.documents = [];
        if (this.filterIsActive) {
            this.filterSettings.Filter.TagIdList = this.tagsForFilter.filter(t => t.IsSelected).map(t => t.Id);
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
            settings.TagIdList = this.tagsForSample.filter(t => t.IsSelected).map(t => t.Id);
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
        // this.route.params.subscribe(params => {
        //     if (params['name'] !== undefined) {
        //     this.dataset = decodeURIComponent(params['name']);
        //     }
        // });
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
                    this.documents.push(...paginated.Items.map<SelectedItem<any>>(
                        d => { return { IsSelected: false, Id: d[this._dataset.IdField], Item: d }; })
                    );
                },
                error => this.errorMessage = <any>error);
        }
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
                let index = this.documents.findIndex(doc => doc.Item[this._dataset.IdField] === d.Item[this._dataset.IdField]);
                this.documents.splice(index, 1);
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
        dialogModel.IsDone = true;
    }

    editDocument(selected: SelectedItem<any>) {
        this.pendingDocument = {
            Document: JSON.stringify(selected.Item, null, 4),
            IsNew: false,
            Id: selected.Item[this._dataset.IdField]
        };
        this.collapsePendingDocument();
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
                updatedDoc[this._dataset.TagField] = (
                    typeof currentItem.Item[this._dataset.TagField] === 'string' ||
                    currentItem.Item[this._dataset.TagField] instanceof String) ? '' : [];
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
            ? this.tagsForFilter.filter(t => t.IsSelected).map(t => t.Id)
            : this.tagsForSample.filter(t => t.IsSelected).map(t => t.Id);
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
            ? this.tagsForFilter.filter(t => t.IsSelected).map(t => t.Id)
            : this.tagsForSample.filter(t => t.IsSelected).map(t => t.Id);
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
                        _.remove(this.documents, d => {
                            return docIdsToMove.indexOf(d.Item[this.dataset.IdField]) > -1;
                        });
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
        let selectedDocs = selectedItems ? selectedItems : this.documents.filter(d => d.IsSelected);
        let idFieldIsString = _.isString(selectedDocs[0].Item[this._dataset.TagField]);
        let tagsForDocs = selectedDocs.map(d => idFieldIsString ? [d.Item[this._dataset.TagField]] : d.Item[this._dataset.TagField]);
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
            IsMultiselectAllowed: !idFieldIsString
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
                        updatedDoc[this._dataset.TagField] = idFieldIsString
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
        let selectedDocs = selectedItems ? selectedItems : this.documents.filter(d => d.IsSelected);
        let idFieldIsString = _.isString(selectedDocs[0].Item[this._dataset.TagField]);
        let tagsForDocs = selectedDocs.map(d => idFieldIsString ? [d.Item[this._dataset.TagField]] : d.Item[this._dataset.TagField]);
        let commonTags = tagsForDocs[0];
        for (let i = 1; i < tagsForDocs.length; i++) {
            commonTags = _.intersection(commonTags, tagsForDocs[i]);
        }
        let tagSelectorModel: TagSelectorModel = {
            Tags: commonTags.length >= 0 ? this.tags.filter(t => commonTags.indexOf(t.Item.Id) > -1).map(t => {
                let sm = _.cloneDeep(t);
                sm.IsSelected = false;
                return sm;
            }) : [],
            IsMultiselectAllowed: true
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
                    Header: 'Remove tags...'
                };
                this.dialogService.progressModel = dialogModel;
                this.dialogService.openDialog('progress');

                let sources = selectedDocs.map<Observable<SelectedItem<any>>>(currentItem => {
                    return Observable.create((observer: Observer<any>) => {
                        let id = currentItem.Item[this._dataset.IdField];
                        let updatedDoc = {};
                        updatedDoc[this._dataset.TagField] = idFieldIsString
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

    saveDocument() {
        let docToSave = JSON.parse(this.pendingDocument.Document);
        if (this.pendingDocument.IsNew) {
            this._documentService.createDocument(this.dataset.Name, docToSave).subscribe(
                error => this.errorMessage = <any>error,
                () => {
                    this.documents.push(JSON.parse(JSON.stringify({
                        IsSelected: false,
                        Item: docToSave
                    })));
                    this.setHeaders();
                    this.collapsePendingDocument();
                }
            );
        } else {
            this._documentService.updateDocument(this.dataset.Name, this.pendingDocument.Id, docToSave).subscribe(
                updatedDoc => {
                    let idField = this._dataset.IdField;
                    let index = this.documents.indexOf(this.documents.find(d => d.Item[idField] === this.pendingDocument.Id));
                    this.documents[index].Item = updatedDoc;
                    this.collapsePendingDocument();
                },
                error => this.errorMessage = <any>error
            );
        }
    }

    collapsePendingDocument() {
        this.newDocumentFormIsCollapsed = !this.newDocumentFormIsCollapsed;
        if (this.newDocumentFormIsCollapsed) {
            this.pendingDocument = JSON.parse(JSON.stringify(this.defaultDocument));
        }
    }

    checkTag(e, tag?: SelectedItem<ITag>, all?: boolean) {
        if (tag) {
            this.tags[this.tags.indexOf(tag)].IsSelected = e.target.checked;
            this.currentTags[this.currentTags.indexOf(tag)].IsSelected = e.target.checked;
        } else {
            this.currentTags.forEach(t => {
                t.IsSelected = e.target.checked;
            });
            if (all) {
                this.tags.forEach(t => {
                    t.IsSelected = e.target.checked;
                });
            } else {
                this.currentTags.forEach(t => {
                    this.tags[this.tags.indexOf(t)].IsSelected = e.target.checked;
                });
            }
        }
    }

    deleteTag(selected: SelectedItem<ITag>) {
        let id = selected.Item.Id;
        this._tagService.deleteTag(this._dataset.Name, id).subscribe(
            error => this.errorMessage = <any>error,
            () => {
                let index = this.tags.findIndex(t => t.Item.Id === selected.Item.Id);
                this.tags.splice(index, 1);
                index = this.currentTags.findIndex(t => t.Item.Id === selected.Item.Id);
                this.currentTags.splice(index, 1);
                this.tagPage = this.tagPage;
            }
        );
    }

    editTag(selected: SelectedItem<ITag>) {
        this.pendingTag = {
            Tag: JSON.parse(JSON.stringify(selected.Item)),
            IsNew: false,
            Id: selected.Id
        };
        this.collapsePendingTag();
    }

    exportWords(selected: SelectedItem<ITag>) {
        var tagIdList = selected ? [selected.Id] : this.tags.filter(t => t.IsSelected).map(t => t.Item.Id);

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
                        },
                        error => this.handleError(error)
                    );
                }
            },
            error => this.handleError(error)
        );
        this.inputDialog.open();
    }

    saveTag() {
        let tagToSave = JSON.parse(JSON.stringify(this.pendingTag.Tag));
        if (this.pendingTag.IsNew) {
            this._tagService.createTag(this.dataset.Name, tagToSave).subscribe(
                (newTag: ITag) => {
                    this.tags.push({
                        IsSelected: false,
                        Item: JSON.parse(JSON.stringify(newTag))
                    });
                    this.currentTags.push({
                        IsSelected: false,
                        Item: JSON.parse(JSON.stringify(newTag))
                    });
                    this.collapsePendingTag();
                },
                error => this.errorMessage = <any>error
            );
        } else {
            this._tagService.updateTag(this.dataset.Name, this.pendingTag.Id, tagToSave).subscribe(
                error => this.errorMessage = <any>error,
                () => {
                    let index = this.tags.indexOf(this.tags.find(d => d.Item.Id === this.pendingTag.Id));
                    this.tags[index] = JSON.parse(JSON.stringify(this.pendingTag.Tag));
                    index = this.currentTags.indexOf(this.currentTags.find(d => d.Item.Id === this.pendingTag.Id));
                    this.currentTags[index] = JSON.parse(JSON.stringify(this.pendingTag.Tag));
                    this.collapsePendingTag();
                }
            );
        }
    }

    collapsePendingTag() {
        this.newTagFormIsCollapsed = !this.newTagFormIsCollapsed;
        if (this.newTagFormIsCollapsed) {
            this.pendingTag = JSON.parse(JSON.stringify(this.defaultTag));
        }
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

    checkFilterTag(e, tag?: SelectedItem<any>) {
        if (tag) {
            this.tagsForFilter[this.tagsForFilter.indexOf(tag)].IsSelected = e.target.checked;
        } else {
            this.tagsForFilter.forEach(t => {
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

    checkSampleTag(e, tag?: SelectedItem<any>) {
        if (tag) {
            this.tagsForSample[this.tagsForSample.indexOf(tag)].IsSelected = e.target.checked;
        } else {
            this.tagsForSample.forEach(t => {
                t.IsSelected = e.target.checked;
            });
        }
    }

    getSample() {
        this._scrollId = null;
        this.filterIsActive = false;
        this.LoadDocuments();
    }

    handleError(response: Response) {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `DataSet error (${response.status})`);
    }
}
