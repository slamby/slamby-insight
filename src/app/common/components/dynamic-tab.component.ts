import { Component, Input, ModuleWithComponentFactories, ChangeDetectorRef } from '@angular/core';
import { ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { OnChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { ITab } from '../../models/itab';
import { Messenger } from './../services/messenger.service';

import * as _ from 'lodash';

@Component({
    selector: 'sl-dynamic-tab',
    styles: [`
    .pane{
      padding: 1em;
    }
  `],
    template: `<div [hidden]="!tab.active">
      <div #target>
      </div>
    </div>`
})
export class DynamicTabComponent implements OnChanges, AfterViewInit, OnDestroy {
    @ViewChild('target', { read: ViewContainerRef }) target;
    @Input() tab: ITab;
    cmpRef: ComponentRef<any>;
    private isViewInitialized: boolean = false;

    @Input() factoryCache: ModuleWithComponentFactories<any>;

    constructor(private messenger: Messenger, private cd: ChangeDetectorRef) { }

    updateComponent() {
        if (!this.isViewInitialized) {
            return;
        }
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }
        this.createInstance();
    }

    private createInstance() {
        let factory = _.find(this.factoryCache.componentFactories, { componentType: this.tab.type });
        if (!factory) {
            console.error('Factory null for type:' + this.tab.type);
            return;
        }
        let newInstance = this.target.createComponent(factory);

        this.cmpRef = newInstance;
        if (this.tab.type.name === 'DocumentsComponent' && this.tab.parameter) {
            this.cmpRef.instance.dataset = this.tab.parameter;
        } else if (this.tab.type.name === 'DocumentDetailsComponent' && this.tab.parameter) {
            this.cmpRef.instance.document = this.tab.parameter;
        }
        this.messenger.sendMessage({
            message: 'setCursor',
            arg: 'pointer'
        });
    }

    ngOnChanges() {
        this.updateComponent();
    }

    ngAfterViewInit() {
        this.isViewInitialized = true;
        this.updateComponent();
        this.cd.detectChanges();
    }

    ngOnDestroy() {
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }
    }
}
