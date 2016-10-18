import { Component, AfterContentInit, Input, ViewChild } from '@angular/core';

import { ITab } from '../../models/itab';
import { Messenger } from './../services/messenger.service';
import { HorizontalScrollDirective } from '../directives/horizontal.scroll.directive';

@Component({
    selector: 'tabs',
    template: require('./tabs.component.html'),
    styles: [require('./tabs.component.scss')]
})
export class TabsComponent implements AfterContentInit {
    @Input() tabs = new Array<ITab>();
    @Input() defaultType: any;
    @Input() canCloseTabs = true;
    @Input() listenMessages = false;
    @Input() clipContent = false;
    @ViewChild(HorizontalScrollDirective) horizontalScroll: HorizontalScrollDirective;

    get contentOverflow(): string {
        return this.clipContent ? 'auto' : 'visible';
    }

    constructor(private messenger: Messenger) {
    }

    addTab(type: any, title: string = null, parameter: any = null): void {
        let newTab = { title: title ? title : type.pageTitle, type: type, active: true, parameter: parameter, icon: type.pageIcon };
        this.tabs.push(newTab);
        this.selectTab(newTab);

        setTimeout(() => this.horizontalScroll.scrollToEnd(), 200);
    }

    ngAfterContentInit() {
        if (this.listenMessages) {
            this.messenger.messageAvailable$.subscribe(m => {
                if (m.message === 'addTab') {
                    this.addTab(m.arg.type, m.arg.title, m.arg.parameter);
                }
                if (m.message === 'addOrSelectTab') {
                    let tabsByType = this.getTabByType(m.arg.type);
                    if (tabsByType.length === 0) {
                        this.addTab(m.arg.type, m.arg.title, m.arg.parameter);
                    } else {
                        this.selectTab(tabsByType[0]);
                    }
                }
            });
        }
        if (this.tabs.length === 0 && this.defaultType) {
            this.addTab(this.defaultType);
        }
        // get all active tabs
        let activeTabs = this.tabs.filter((tab) => tab.active);

        // if there is no active tab set, activate the first
        if (activeTabs.length === 0) {
            this.selectTab(this.tabs[0]);
        }
    }

    selectTab(tab: ITab) {
        // deactivate all tabs
        if (this.tabs.length > 0) {
            this.tabs.forEach(t => t.active = false);
        }

        // activate the tab the user has clicked on.
        if (tab) {
            tab.active = true;
        }
    }

    getTabByType(type: any): ITab[] {
        return this.tabs.filter(t => t.type === type);
    }

    closeTab(tab: ITab) {

        let index = this.tabs.findIndex((t) => {
            return t === tab;
        });

        if (index >= 0) {
            this.tabs.splice(index, 1);
            if (this.tabs.length === 0) {
                this.addTab(this.defaultType);
            } else {
                this.tabs.forEach(t => t.active = false);
                index === 0 ? this.tabs[index].active = true : this.tabs[index - 1].active = true;
            }
        }
    }

    tabMouseDown(event: MouseEvent, tab: ITab) {
        // Middle button
        if (event.button === 1) {
            this.closeTab(tab);
        }
    }
}
