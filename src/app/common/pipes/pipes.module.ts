import { ConvertTextToUrl } from './convert-text-to-url-pipe';
import { SelectedItemsPipe, SelectedItemsCountPipe } from './selected-items-pipe';
import { NullDatePipe } from './nulldate.pipe';

export const PIPES_DECLARATIONS: any[] = [
    ConvertTextToUrl,
    SelectedItemsPipe,
    SelectedItemsCountPipe,
    NullDatePipe
];
