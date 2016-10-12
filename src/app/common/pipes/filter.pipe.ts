import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'filter'
})

export class FilterPipe implements PipeTransform {
    transform(value: any, args: any): any {
        if (args && Array.isArray(value)) {
            return value.filter(item => _.isMatchWith(item, args, this.customizer));
        }

        return value;
    }

    customizer(objValue: any, srcValue: any) {
        if (typeof objValue === 'string') {
            return objValue.toLowerCase().indexOf(srcValue) > -1;
        }
    }
}
