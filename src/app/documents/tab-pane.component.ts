import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { Response } from '@angular/http';
import { Observable, Observer } from 'rxjs';

import { NotificationService } from '../common/services/notification.service';
import { ToasterNotificationService } from '../common/services/toaster.notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';

import { TagService } from '../common/services/tag.service';
import { DatasetService } from '../common/services/dataset.service';
import { DatasetSelectorModel } from '../datasets/dataset-selector.model';
import { DatasetSelectorDialogComponent } from '../datasets/dataset-selector.dialog.component';
import { IDataSet, ITag, IProcess, ITagsExportWordsSettings, IBulkResults } from 'slamby-sdk-angular2';
import { SelectedItem } from '../models/selected-item';
import { TagWrapper } from '../models/tag-wrapper';
import { CommonInputModel } from '../models/common-input.model';
import { ConfirmDialogComponent } from '../common/components/confirm.dialog.component';
import { ConfirmModel } from '../models/confirm.model';
import { DialogResult } from '../models/dialog-result';
import { ProgressDialogModel } from '../models/progress-dialog-model';
import { DialogComponent } from '../common/components/dialog.component';
import { CommonInputDialogComponent } from '../common/components/common-input.dialog.component';
import { Messenger } from '../common/services/messenger.service';
import { ProcessesComponent } from '../processes/processes.component';

import { TagEditorDialogComponent } from './tag-editor.dialog.component';

import * as _ from 'lodash';
const naturalSort = require('node-natural-sort');

@Component({
    selector: 'sl-tab-pane',
    templateUrl: 'tab-pane.component.html'
})
export class TabPaneComponent implements OnInit {
    private _tags: Array<SelectedItem<ITag>> = [];
    get tags() {
        return this._tags;
    }
    set tags(tags: Array<SelectedItem<ITag>>) {
        this._tags = tags;
        this.onChanged.emit(tags);
    }
    errorMessage: string;

    _dataset: IDataSet;

    @Input()
    set dataset(dataset: IDataSet) {
        this._dataset = dataset;
        this.LoadTags();
    }
    get dataset() {
        return this._dataset;
    }
    @Output() onDeleted: EventEmitter<string> = new EventEmitter<string>();
    @Output() onChanged: EventEmitter<Array<SelectedItem<ITag>>> = new EventEmitter<Array<SelectedItem<ITag>>>();

    @ViewChild(DialogComponent) dialogService: DialogComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog: ConfirmDialogComponent;
    @ViewChild(CommonInputDialogComponent) inputDialog: CommonInputDialogComponent;
    @ViewChild(TagEditorDialogComponent) tagEditorDialog: TagEditorDialogComponent;
    @ViewChild(DatasetSelectorDialogComponent) datasetSelector: DatasetSelectorDialogComponent;

    constructor(private _tagService: TagService, private _notificationService: NotificationService,
                private _messenger: Messenger, private _datasetService: DatasetService,
                private _toasterNotificationToaster: ToasterNotificationService) { }

    ngOnInit() { }

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

    getSelectedItemsCount(documents: Array<SelectedItem<any>>) {
        let selectedCount = documents ? documents.filter(t => t.IsSelected).length : 0;
        return selectedCount;
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
            Message: `Are you sure to remove ${selectedTags.length} tag(s)`,
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
        let selectedTags = selectedItems ? selectedItems :
            this.tags.filter(d => d.IsSelected).sort((a, b) => a.Item.Properties.Level - b.Item.Properties.Level);
        selectedTags.reverse();
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
                    () => {
                        observer.next(currentItem);
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
            (t: SelectedItem<ITag>) => {
                this.tags = _.without(this.tags, t);
                this.onDeleted.emit(t.Id);
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

    copyAllTo() {
        return this.copyTo(this.tags.map(t => t.Item));
    }

    copyTo(selectedTags: Array<any>) {
        if (!selectedTags || selectedTags.length === 0) {
            selectedTags = selectedTags ? selectedTags : this.tags.filter(t => t.IsSelected).map(t => t.Item);
        }
        if (this.checkArrayIsEmpty(selectedTags)) {
            return;
        }
        let datasetSelectorModel: DatasetSelectorModel;
        this.datasetSelector.dialogClosed.subscribe(
            (model: DatasetSelectorModel) => {
                if (model.Result !== DialogResult.Ok) {
                    return;
                }
                this.dialogService.progressModel = { Header: 'Copy Tags...' };
                this.dialogService.openDialog('indeterminateprogress');
                this._tagService.bulkImport(
                    model.Selected.Name,
                    selectedTags
                )
                    .finally(() => {
                        this.dialogService.close();
                    })
                    .subscribe((resp: IBulkResults) => {
                        this.errorMessage = resp.Results.filter(r => r.StatusCode !== 200)
                                .map(r => r.Error).join(' | ');
                    },
                    error => {
                        this.handleError(error);
                    });
            },
            error => this.handleError(error)
        );
        this.datasetSelector.dialogOpened.subscribe(() => {
            this._datasetService.getDatasets().finally(() => this.datasetSelector.showProgress = false).subscribe(
                (datasets: Array<IDataSet>) => {
                    datasetSelectorModel = {
                        Datasets: datasets
                            .filter(ds => ds !== this._dataset)
                            .sort((a, b) => a.Name.localeCompare(b.Name)),
                        Selected: datasets.length > 0 ? datasets[0] : null
                    };
                    this.datasetSelector.model = datasetSelectorModel;
                },
                error => this.handleError(error)
            );
        });
        this.datasetSelector.model = null;
        this.datasetSelector.showProgress = true;
        this.datasetSelector.open();
    }

    export() {
        let papa = require('papaparse');
        const {dialog} = require('electron').remote;
        let fs = require('fs');
        let filePath = dialog.showSaveDialog(
            {
                filters: [{name: 'CSV', extensions: ['csv'] }]
            }
        );
        if (!filePath) {
            return;
        }
        let that = this;
        fs.writeFile(
            filePath,
            papa.unparse(
                this.tags.map(function (t) {
                    return {
                        Id: t.Item.Id,
                        Name: t.Item.Name,
                        ParentId: t.Item.ParentId
                    };
                }),
                {
                    quotes: true,
                    header: true
                }),
            function (error) {
                if (error) {
                    that._notificationService.error(`${error}`, `Tag export error`);
                    that._toasterNotificationToaster.error(`${error}`, `Tag export error`);
                } else {
                    that._notificationService.info(`Tags was successfully exported to ${filePath}`, 'Tag export finished');
                    that._toasterNotificationToaster.success(`Tags was successfully exported to ${filePath}`, 'Tag export finished');
                }
            }
        );
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

    handleError(response: Response): string {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `Tag error (${response.status})`);
        this._toasterNotificationToaster.error(`${errors}`, `Tag error (${response.status})`);
        return errors;
    }
}
