import { Pipe } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'nullDate'
})
export class NullDatePipe {
    constructor(private datePipe: DatePipe) {}

    transform(value: any, format: string, text = ''): string {
        if (!value || value === '0001-01-01T00:00:00') {
            return text;
        }
        return this.datePipe.transform(new Date(value), format);
    }
}