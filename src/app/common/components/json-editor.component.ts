import { Component, Input, forwardRef, OnChanges, ExistingProvider } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl } from '@angular/forms';

// http://blog.thoughtram.io/angular/2016/07/27/custom-form-controls-in-angular-2.html
const VALUE_ACCESSOR_PROVIDER: ExistingProvider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => JsonEditorComponent),
    multi: true
};
const VALIDATOR_PROVIDER: ExistingProvider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => JsonEditorComponent),
    multi: true
};

@Component({
    selector: 'sl-json-editor',
    template: require('./json-editor.component.html'),
    styles: [require('./json-editor.component.scss')],
    providers: [VALUE_ACCESSOR_PROVIDER, VALIDATOR_PROVIDER]
})
export class JsonEditorComponent implements ControlValueAccessor, OnChanges {
    private _json: string = '';
    @Input() readonly: boolean = false;
    @Input() height: string = '200px';

    get json() {
        return this._json;
    }

    @Input() set json(val) {
        this._json = val;
        this.propagateChange(val);
    }

    propagateChange: any = (_: any) => { };

    constructor() {
    }

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

    validate(c: FormControl) {
        let error = {
            validateJson: {
                valid: false
            }
        };

        return this.tryParseJSON(c.value) ? null : error;
    }

    tryParseJSON(jsonString): boolean {
        try {
            let o = JSON.parse(jsonString);

            // Handle non-exception-throwing cases:
            // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
            // but... JSON.parse(null) returns null, and typeof null === "object", 
            // so we must check for that, too. Thankfully, null is falsey, so this suffices:
            if (o && typeof o === 'object') {
                return o;
            }
        } catch (e) { }

        return false;
    };
}
