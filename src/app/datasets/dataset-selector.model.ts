import { IDataSet } from 'slamby-sdk-angular2';
import { DialogResult } from '../models/dialog-result';

export interface DatasetSelectorModel {
    Datasets: Array<IDataSet>;
    Selected: IDataSet;
    Result?: DialogResult;
}
