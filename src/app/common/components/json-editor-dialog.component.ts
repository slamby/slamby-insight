import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'sl-json-editor-dialog',
    template: require('./json-editor-dialog.component.html')
})
export class JsonEditorDialogComponent implements OnInit {
    @Input() json: any;
    @Input() header: string = 'JSON';
    @Input() readonly: boolean = false;
    @ViewChild('template') template;

    modalOptions: NgbModalOptions = {
        backdrop: true,
        keyboard: true,
        size: 'lg'
    };

    constructor(private modal: NgbModal) { }

    ngOnInit() { }

    open() {
        this.modal.open(this.template, this.modalOptions);
    }
}
