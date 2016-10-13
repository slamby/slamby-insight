import { Component, ViewChild, Input, ChangeDetectionStrategy, AfterViewInit, ContentChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ITag } from 'slamby-sdk-angular2';
import { TagListSelectorComponent } from './taglist-selector.component';

@Component({
    selector: 'taglist-selector-dialog',
    template: require('./taglist-selector-dialog.component.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListSelectorDialogComponent implements AfterViewInit {
    @Input() tags: ITag[] = [];
    @Input() selectedTagIds: string[] = [];

    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg',
        windowClass: 'xl-dialog'
    };

    constructor(private modal: NgbModal) {
    }

    ngAfterViewInit() {
        // this.taglistSelector.tags = this.tags;
        // this.taglistSelector.selectedTagIds = this.selectedTagIds;
    }

    open(): NgbModalRef {
        return this.modal.open(this.template, this.modalOptions);
    }

    selectionChanged(selectedTagIds: string[]) {
        this.selectedTagIds = selectedTagIds.slice();
    }
}
