import { ConvertTextToUrl } from './convert-text-to-url.pipe';
import { SelectedItemsPipe } from './selected-items.pipe';
import { SelectedItemsCountPipe } from './selected-items-count.pipe';
import { NullDatePipe } from './nulldate.pipe';
import { FilterPipe } from './filter.pipe';

export const PIPES_DECLARATIONS: any[] = [
    ConvertTextToUrl,
    SelectedItemsPipe,
    SelectedItemsCountPipe,
    NullDatePipe,
    FilterPipe
];
