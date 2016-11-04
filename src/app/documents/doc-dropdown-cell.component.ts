import { Component } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-ng2/main';

@Component({
    selector: 'sl-docdropdown-cell',
    template: require('./doc-dropdown-cell.component.html'),
    styles: [require('./doc-dropdown-cell.component.scss')]
})
export class DocDropdownCellComponent implements AgRendererComponent {
    private params: any;

    agInit(params: any): void {
        this.params = params;
    }

    invoke(command: string): void {
        this.params.context.mainComponent.invoke(command, this.params.data);
    }
}
