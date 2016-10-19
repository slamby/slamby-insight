import { Component, Input, Output, AfterContentInit, EventEmitter } from '@angular/core';
import { ITag } from 'slamby-sdk-angular2';

import * as _ from 'lodash';

@Component({
    selector: 'sl-taglist-selector',
    template: require('./taglist-selector.component.html')
})
export class TagListSelectorComponent implements AfterContentInit  {

    @Input() tags: ITag[] = [];
    @Input() selectedTagIds: string[] = [];
    @Output() selectionChanged: EventEmitter<string[]> = new EventEmitter<string[]>();

    idFilter: string = '';
    nameFilter: string = '';

    filteredTags: ITag[];

    constructor() {
    }

    ngAfterContentInit () {
        this.filteredTags = this.filter();
    }

    modelChange(value: string) {
        this.filteredTags = this.filter();
    }

    isSelected(tag: ITag): boolean {
        return this.findIndex(tag) > -1;
    }

    findIndex(tag: ITag): number {
        return this.selectedTagIds.findIndex((id: string) => id === tag.Id);
    }

    selectAll() {
        this.selectedTagIds = this.tags.map<string>(t => t.Id);
        this.emitChanges();
    }

    getFilteredIds(): string[] {
        return this.filteredTags.map<string>(t => t.Id);
    }

    selectFiltered() {
        this.selectedTagIds = this.getFilteredIds();
        this.emitChanges();
    }

    unselectAll() {
        this.selectedTagIds = [];
        this.emitChanges();
    }

    unselectFiltered() {
        let filteredIds = this.getFilteredIds();
        this.selectedTagIds = this.selectedTagIds.filter(id => filteredIds.indexOf(id) === -1);
        this.emitChanges();
    }

    emitChanges() {
        this.selectionChanged.emit(this.selectedTagIds);
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

        this.selectionChanged.emit(this.selectedTagIds);
    }

    // filterInputKeyUp(event) {
    //     this.filteredTags = this.filter();
    // }

    filter(): ITag[] {
        if (!this.idFilter && !this.nameFilter) {
            return this.tags;
        }

        return this.tags.filter(item => _.isMatchWith(item, { Id: this.idFilter }, this.matchCustomizer))
            .filter(item => _.isMatchWith(item, { Name: this.nameFilter }, this.matchCustomizer));
    }

    matchCustomizer(objValue: any, srcValue: any) {
        if (typeof objValue === 'string') {
            return objValue.toLowerCase().indexOf(srcValue) > -1;
        }
    }
}
