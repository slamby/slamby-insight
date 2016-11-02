import { Component } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-ng2/main';

@Component({
    selector: 'sl-docdropdown-cell',
    template: `
    <div ngbDropdown class="dropdown btn-group">
        <button type="button" class="btn btn-xs btn-default" (click)="invoke('editDocument')">Edit</button>
        <button ngbDropdownToggle type="button" class="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" 
                aria-haspopup="true" aria-expanded="false">
            <span class="caret"></span>
            <span class="sr-only">Toggle Dropdown</span>
        </button>
        <ul class="dropdown-menu" aria-labelledby="documentDropdownMenu">
            <li><a (click)="invoke('preview')">Preview</a></li>
            <li><a (click)="invoke('openDocument')">Open</a></li>
            <li><a (click)="invoke('editDocument')">Edit</a></li>
            <li><a (click)="invoke('copyTo')">Copy To</a></li>
            <li><a (click)="invoke('moveTo')">Move To</a></li>
            <li><a (click)="invoke('addTags')">Add Tags</a></li>
            <li><a (click)="invoke('removeTags')">Remove Tags</a></li>
            <li><a (click)="invoke('clearTags')">Clear Tags</a></li>
            <li><a (click)="invoke('deleteDocuments')">Delete</a></li>
        </ul>
    </div>`,
    styles: [`
        .dropdown.open {
            position: fixed;
            z-index: 1000;
        }
    `]
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
