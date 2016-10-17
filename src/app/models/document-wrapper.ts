import {DialogResult} from '../models/dialog-result';
export interface DocumentWrapper {
    Document: any;
    IsNew: boolean;
    Id: string;
    Header: string;
    Result?: DialogResult;
    ErrorMessage?: string;
}
