import { Component, Input, forwardRef, OnChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// http://blog.thoughtram.io/angular/2016/07/27/custom-form-controls-in-angular-2.html

@Component({
    selector: 'json-editor',
    template: require('./json-editor.component.html'),
    styles: [require('./json-editor.component.scss')],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JsonEditorComponent), multi: true }
    ]
})
export class JsonEditorComponent implements ControlValueAccessor, OnChanges {
    @Input('json') _json: string = '';
    @Input() readonly: boolean = false;
    @Input() height: string = '200px';

    get json() {
        return this._json;
    }

    set json(val) {
        this._json = val;
        this.propagateChange(val);
    }

    propagateChange: any = (_: any) => { };

    constructor() { }

    ngOnChanges(inputs) {

    }

    writeValue(value) {
        if (value) {
            this.json = value;
        }
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched() { }
}
