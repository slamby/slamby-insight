import { Component, Input, ViewChild, ViewContainerRef, ComponentRef, ModuleWithComponentFactories } from '@angular/core';
import { OnChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { RuntimeCompiler, COMPILER_PROVIDERS }  from '@angular/compiler';
import { AppModule } from '../../app.module';
import { ITab } from '../../models/itab';

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

    constructor(private compiler: RuntimeCompiler) { }

    updateComponent() {
        if (!this.isViewInitialized) {
            return;
        }
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }

        this.compiler.compileModuleAndAllComponentsAsync(AppModule).then(
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
