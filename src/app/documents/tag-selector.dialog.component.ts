import { Component, Input, ViewChild } from '@angular/core';
import { ITag } from 'slamby-sdk-angular2';
import { TagSelectorModel } from './tag-selector.model';
import { DialogResult } from '../models/dialog-result';
import { SelectedItem } from '../models/selected-item';
import { Subject } from 'rxjs';

import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'tag-selector',
    template: require('./tag-selector.dialog.component.html')
})
export class TagSelectorDialogComponent {
    @Input() model: TagSelectorModel;
    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg'
    };
    private selected: SelectedItem<ITag>;
    currentTags: Array<SelectedItem<ITag>> = [];

    tagPageSize = 10;
    _tagPage = 1;

    private dialogClosedEventSource = new Subject<TagSelectorModel>();
    dialogClosed = this.dialogClosedEventSource.asObservable();

    constructor(private modal: NgbModal) {
    }

    set tagPage(page: number) {
        if (this.model != null && this.model.Tags != null) {
            this._tagPage = page * this.tagPageSize > this.model.Tags.length ? page - 1 : page;
            if (this.model.Tags.length > 0) {
                this.currentTags = this.model.Tags.slice((page - 1) * this.tagPageSize,
                page * this.tagPageSize > this.model.Tags.length ? this.model.Tags.length : page * this.tagPageSize);
            }
        } else {
            this._tagPage = 1;
        }
    }

    get tagPage() {
        return this._tagPage;
    }

    checkTag(e, tag?: SelectedItem<ITag>, all?: boolean) {
        if (tag) {
            this.model.Tags[this.model.Tags.findIndex(t => t.Item.Id === tag.Item.Id)].IsSelected = e.target.checked;
            this.currentTags[this.currentTags.findIndex(t => t.Item.Id === tag.Item.Id)].IsSelected = e.target.checked;
        } else {
            this.currentTags.forEach(t => {
                t.IsSelected = e.target.checked;
            });
            if (all) {
                this.model.Tags.forEach(t => {
                    t.IsSelected = e.target.checked;
                });
            } else {
                this.currentTags.forEach(t1 => {
                    this.model.Tags[this.model.Tags.findIndex(t2 => t1.Item.Id === t2.Item.Id)].IsSelected = e.target.checked;
                });
            }
        }
        this.model.Tags = JSON.parse(JSON.stringify(this.model.Tags));
        this.currentTags = JSON.parse(JSON.stringify(this.currentTags));
    }

    open() {
        if (this.model.IsMultiselectAllowed) {
            this.tagPage = 1;
        } else {
            this.selected = this.model.Tags[this.model.Tags.findIndex(t => t.IsSelected)];
        }
        this.modal.open(this.template, this.modalOptions);
    }

    cancel() {
        this.model.Result = DialogResult.Cancel;
        this.dialogClosedEventSource.next(this.model);
        this.dialogClosedEventSource = new Subject<TagSelectorModel>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
    }

    ok() {
        this.model.Result = DialogResult.Ok;
        this.dialogClosedEventSource.next(this.model);
        this.dialogClosedEventSource = new Subject<TagSelectorModel>();
        this.dialogClosed = this.dialogClosedEventSource.asObservable();
    }

    select(newValue) {
        this.model.Tags.forEach(t => t.IsSelected = false);
        this.model.Tags[this.model.Tags.findIndex(t => t.Item.Id === newValue.Item.Id)].IsSelected = true;
        this.selected = newValue;
    }
}
