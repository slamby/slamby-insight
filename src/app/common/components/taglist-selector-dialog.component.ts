import { Component, ViewChild, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ITag } from 'slamby-sdk-angular2';

@Component({
    selector: 'sl-taglist-selector-dialog',
    template: require('./taglist-selector-dialog.component.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListSelectorDialogComponent {
    @Input() tags: ITag[] = [];
    @Input() selectedTagIds: string[] = [];
    @Input() isMultiselectAllowed: boolean = true;

    private selectedItem;

    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg',
        windowClass: 'xl-dialog'
    };

    constructor(private modal: NgbModal) {
    }

    open(): NgbModalRef {
        if (!this.isMultiselectAllowed && this.selectedTagIds && this.tags) {
            this.selectedItem = this.tags.find(t => t.Id === this.selectedTagIds[0]);
        }
        return this.modal.open(this.template, this.modalOptions);
    }

    selectionChanged(selectedTagIds: string[]) {
        this.selectedTagIds = selectedTagIds.slice();
        if (this.selectedTagIds && this.tags) {
            this.selectedItem = this.tags.find(t => t.Id === this.selectedTagIds[0]);
        }
    }
}
