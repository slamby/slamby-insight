import { IDataSet } from 'slamby-sdk-angular2';
import {DialogResult} from '../models/dialog-result';
export interface DataSetWrapper {
    Header: string;
    dataSet: IDataSet;
    sampleDocumentChecked: boolean;
    IsNew: boolean;
    Name: string;
    Result?: DialogResult;
}
