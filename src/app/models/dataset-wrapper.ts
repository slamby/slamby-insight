import { IDataSet } from 'slamby-sdk-angular2';
export interface DataSetWrapper {
    dataSet: IDataSet;
    sampleDocumentChecked: boolean;
    IsNew: boolean;
    Name: string;
}
