import { Component, Input, forwardRef, ExistingProvider } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// http://blog.thoughtram.io/angular/2016/07/27/custom-form-controls-in-angular-2.html
const VALUE_ACCESSOR_PROVIDER: ExistingProvider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NGramSelectorComponent),
    multi: true
};

@Component({
    selector: 'sl-ngram-selector',
    template: require('./ngram-selector.component.html'),
    styles: [require('./ngram-selector.component.scss')],
    providers: [VALUE_ACCESSOR_PROVIDER]
})
export class NGramSelectorComponent implements ControlValueAccessor {

    private _count: number = 0;
    private _options: number[] = [];

    @Input()
    set count(c: number) {
        this._count = c;
        this._options = this.fillArray(c);
    }
    get count() {
        return this._count;
    }

    @Input()
    set options(value: number[]) {
        this._options = value || [];
    }
    get options(): number[] {
        return this._options;
    }

    private _selected: number[] = [];
    @Input()
    set selected(sel: number[]) {
        this._selected = sel || [];
    }
    get selected() {
        return this._selected;
    }

    propagateChange: any = (_: any) => { };

    fillArray(num: number): number[] {
        return Array(num).fill(0).map((item, index) => index + 1);
    }

    isSelected(option: number): boolean {
        return this.selected.indexOf(option) > -1;
    }

    updateSelection(option, event: Event) {
        let target = event.target as HTMLInputElement;

        // at least one NGram must be checked
        if (this.selected.length === 1 && !target.checked) {
            target.checked = true;
            event.preventDefault();
            return;
        }

        let index = this.selected.indexOf(option);

        if (target.checked && index === -1) {
            this.selected.push(option);
        }
        if (!target.checked && index > -1) {
            this.selected.splice(index, 1);
        }

        this.propagateChange(this.selected);
    }

    writeValue(value: number[]) {
        if (value) {
            this.selected = value;
        }
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched() { }
}
