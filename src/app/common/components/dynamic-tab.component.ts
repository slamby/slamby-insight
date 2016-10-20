import { Component, Input, ViewChild, ViewContainerRef, ComponentRef, ModuleWithComponentFactories } from '@angular/core';
import { OnChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { RuntimeCompiler, COMPILER_PROVIDERS } from '@angular/compiler';
import { AppModule } from '../../app.module';
import { WelcomeModule } from '../../home/welcome.module';
import { DatasetsModule } from '../../datasets/datasets.module';
import { DocumentsModule } from '../../documents/documents.module';
import { ServicesModule } from '../../services/services.module';
import { ImportModule } from '../../import/import.module';
import { ProcessesModule } from '../../processes/processes.module';
import { ResourcesModule } from '../../resources/resources.module';
import { NotificationsModule } from '../../notifications/notifications.module';
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
    </div>`,
    providers: [RuntimeCompiler, COMPILER_PROVIDERS]
})
export class DynamicTabComponent implements OnChanges, AfterViewInit, OnDestroy {
    @ViewChild('target', { read: ViewContainerRef }) target;
    @Input() tab: ITab;
    cmpRef: ComponentRef<any>;
    private isViewInitialized: boolean = false;

    constructor(private compiler: RuntimeCompiler,
        private messenger: Messenger) { }

    updateComponent() {
        if (!this.isViewInitialized) {
            return;
        }
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }
        let module = AppModule;
        switch (this.tab.type.name) {
            case 'WelcomeComponent':
                module = WelcomeModule;
                break;
            case 'DatasetsComponent':
                module = DatasetsModule;
                break;
            case 'DocumentsComponent':
                module = DocumentsModule;
                break;
            case 'ServicesComponent':
                module = ServicesModule;
                break;
            case 'ImportComponent':
                module = ImportModule;
                break;
            case 'ProcessesComponent':
                module = ProcessesModule;
                break;
            case 'ResourcesComponent':
                module = ResourcesModule;
                break;
            case 'NotificationComponent':
                module = NotificationsModule;
                break;
            default:
                break;
        }
        this.compiler.compileModuleAndAllComponentsAsync(module).then(
            (moduleWithFactories: ModuleWithComponentFactories<any>) => {
                let factory = _.find(moduleWithFactories.componentFactories, { componentType: this.tab.type });
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
        );
    }

    ngOnChanges() {
        this.updateComponent();
    }

    ngAfterViewInit() {
        this.isViewInitialized = true;
        this.updateComponent();
    }

    ngOnDestroy() {
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }
    }
}
