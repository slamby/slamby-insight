import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { Response } from '@angular/http';
import { Observable, Observer } from 'rxjs';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';

import { TagService } from '../common/services/tag.service';
import { IDataSet, ITag, IProcess, ITagsExportWordsSettings } from 'slamby-sdk-angular2';
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
    tags: Array<SelectedItem<ITag>> = [];
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

    @ViewChild(DialogComponent) dialogService: DialogComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog: ConfirmDialogComponent;
    @ViewChild(CommonInputDialogComponent) inputDialog: CommonInputDialogComponent;
    @ViewChild(TagEditorDialogComponent) tagEditorDialog: TagEditorDialogComponent;

    constructor(private _tagService: TagService, private _notificationService: NotificationService, private _messenger: Messenger) { }

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

    handleError(response: Response): string {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `Tag error (${response.status})`);
        return errors;
    }
}