import { Component, Input, Output, AfterContentInit, EventEmitter, ViewChild, ElementRef } from '@angular/core';
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
    @ViewChild('tableBodyDiv') tableBodyDiv: ElementRef;

    idFilter: string = '';
    nameFilter: string = '';
    parentIdFilter: string = '';
    levelFilter: string = '';
    leafFilter: string = '';

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

    filter(): ITag[] {
        if (!this.idFilter &&
            !this.nameFilter &&
            !this.parentIdFilter &&
            !this.levelFilter &&
            !this.leafFilter) {
            return this.tags;
        }

        this.tableBodyDiv.nativeElement.scrollTop = 0;

        let tags = this.tags;
        if (this.idFilter) {
            tags = tags .filter(item => _.isMatchWith(item, { Id: this.idFilter }, this.matchCustomizer));
        }
        if (this.nameFilter) {
            tags = tags.filter(item => _.isMatchWith(item, { Name: this.nameFilter }, this.matchCustomizer));
        }
        if (this.parentIdFilter) {
            tags = tags.filter(item => _.isMatchWith(item, { ParentId: this.parentIdFilter }, this.matchCustomizer));
        }
        if (this.levelFilter) {
            tags = tags.filter(item => _.isMatchWith(item, { Properties: { Level: this.levelFilter }}, this.matchCustomizer));
        }
        if (this.leafFilter) {
            tags = tags.filter(item => _.isMatchWith(item, { Properties: { IsLeaf: this.leafFilter }}, this.matchCustomizer));
        }
        return tags;
    }

    matchCustomizer(objValue: any, srcValue: any) {
        if (typeof objValue === 'string') {
            return objValue.toLowerCase().indexOf(srcValue) > -1;
        }
        if (typeof objValue === 'object') {
            if (srcValue.Level !== undefined) {
                return objValue.Level.toString() === srcValue.Level.toString();
            }
            if (srcValue.IsLeaf !== undefined) {
                return objValue.IsLeaf.toString().toLowerCase().indexOf(srcValue.IsLeaf.toString()) > -1;
            }
        }
    }
}
