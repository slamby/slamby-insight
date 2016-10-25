import { ITag } from 'slamby-sdk-angular2';
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
        if (_.isString(objValue)) {
            return objValue.toLowerCase().indexOf(srcValue) > -1;
        }
        else if (_.isNumber(objValue)) {
            let parsedValue = objValue.toString();
            return parsedValue.toLowerCase().indexOf(srcValue) > -1;
        }
        else if (_.isBoolean(objValue)) {
            let parsedValue = JSON.parse(srcValue);
            if (parsedValue == null) {
                return true;
            }
            return objValue === parsedValue;
        }
        else if (_.isArray<ITag>(objValue)) {
            let joinedPath = _.join((<Array<ITag>>objValue).map(t => t.Name), ' > ');
            return joinedPath.toLowerCase().indexOf(srcValue) > -1;
        }
    }
}
