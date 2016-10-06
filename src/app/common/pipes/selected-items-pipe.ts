import { Pipe } from '@angular/core';
import { SelectedItem } from '../../models/selected-item';

@Pipe({ name: 'selectedItemsPipe' })
export class SelectedItemsPipe {
    transform(value: Array<SelectedItem<any>>) {
        let selectedCount = value.filter(t => t.IsSelected).length;
        return (selectedCount === value.length || selectedCount === 0 ? 'All' : selectedCount.toString());
    }
}

@Pipe({ name: 'selectedItemsCountPipe' })
export class SelectedItemsCountPipe {
    transform(value: Array<SelectedItem<any>>) {
        let selectedCount = value.filter(t => t.IsSelected).length;
        return selectedCount;
    }
}
