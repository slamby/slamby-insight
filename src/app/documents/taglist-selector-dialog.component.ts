import { Component, ViewChild, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ITag } from 'slamby-sdk-angular2';

@Component({
    selector: 'taglist-selector-dialog',
    template: require('./taglist-selector-dialog.component.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListSelectorDialogComponent {

    @Input() tags: ITag[] = [];
    @Input() selectedTagIds: string[] = [];

    @ViewChild('template') template;
    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: true,
        size: 'lg',
        windowClass: 'xl-dialog'
    };

    constructor(private modal: NgbModal, private cd: ChangeDetectorRef) {
    }

    open(): NgbModalRef {
        return this.modal.open(this.template, this.modalOptions);
    }

    isSelected(tag: ITag): boolean {
        return this.findIndex(tag) > -1;
    }

    findIndex(tag: ITag): number {
        return this.selectedTagIds.findIndex((id: string) => id === tag.Id);
    }

    selectAll() {
        this.selectedTagIds = this.tags.map<string>(t => t.Id);
        this.cd.detectChanges();
    }

    selectNone() {
        this.selectedTagIds = [];
        this.cd.detectChanges();
    }

    check(tag: ITag, event) {
        let index = this.findIndex(tag);

        if (event.target.checked && index === -1) {
            this.selectedTagIds.push(tag.Id);
        } else {
            if (index > -1) {
                this.selectedTagIds.splice(index, 1);
            }
        }

        this.cd.detectChanges();
    }
}
