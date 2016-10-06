import {ITag} from 'slamby-sdk-angular2';
import {DialogResult} from '../models/dialog-result';
import {SelectedItem} from '../models/selected-item';

export interface TagSelectorModel {
    Tags: Array<SelectedItem<ITag>>;
    IsMultiselectAllowed: Boolean;
    Result?: DialogResult;
}
