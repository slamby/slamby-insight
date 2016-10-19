import { DialogResult } from '../models/dialog-result';

export interface CommonInputModel {
    Model: any;
    Header: string;
    ErrorMessage?: string;
    Result?: DialogResult;
}
