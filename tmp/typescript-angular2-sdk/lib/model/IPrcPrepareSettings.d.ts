import * as models from './models';
export interface IPrcPrepareSettings {
    DataSetName?: string;
    TagIdList?: Array<string>;
    CompressLevel?: number;
    CompressSettings?: models.ICompressSettings;
}
