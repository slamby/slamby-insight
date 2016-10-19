import { Pipe, PipeTransform } from '@angular/core';
import { SelectedItem } from '../../models/selected-item';

@Pipe({ name: 'selectedItemsCountPipe' })
export class SelectedItemsCountPipe implements PipeTransform {
    transform(value: Array<SelectedItem<any>>) {
        let selectedCount = value.filter(t => t.IsSelected).length;
        return selectedCount;
    }
}
