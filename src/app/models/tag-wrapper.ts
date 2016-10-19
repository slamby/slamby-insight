import { ITag } from 'slamby-sdk-angular2';
import { DialogResult } from '../models/dialog-result';

export interface TagWrapper {
    Tag: ITag;
    IsNew: boolean;
    Id: string;
    Header: string;
    Result?: DialogResult;
    ErrorMessage?: string;
}
