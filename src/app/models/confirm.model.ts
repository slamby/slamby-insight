import {DialogResult} from '../models/dialog-result';
export interface ConfirmModel {
    Header: string;
    Message: string;
    Buttons: Array<string>;
    Result?: DialogResult;
}