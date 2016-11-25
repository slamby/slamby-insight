import { Component, Input } from '@angular/core';

@Component({
    selector: 'sl-ngram-selector',
    template: require('./ngram-selector.component.html'),
    styles: [require('./ngram-selector.component.scss')]
})
export class NGramSelectorComponent {

    private _count: number = 0;
    private options: number[] = [];

    @Input()
    set count(c: number) {
        this._count = c;
        this.options = this.fillArray(c);
    }
    get count () {
        return this._count;
    }

    @Input() selected: number[] = [];

    @Input() set selectMax(max: number) {
        this.selected = this.fillArray(max);
    }

    fillArray(num: number): number[] {
        return Array(num).fill(0).map((item, index) => index + 1);
    }

    isSelected(option: number): boolean {
        return this.selected.indexOf(option) > -1;
    }

    updateSelection(option, event) {
        let index = this.selected.indexOf(option);
        if (event.target.checked && index === -1) {
            this.selected.push(option);
        }
        if (!event.target.checked && index > -1) {
            this.selected.splice(index, 1);
        }
    }
}
