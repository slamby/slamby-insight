import * as models from './models';
export interface IClassifierPrepareSettings {
    DataSetName?: string;
    TagIdList?: Array<string>;
    NGramList?: Array<number>;
    CompressLevel?: number;
    CompressSettings?: models.ICompressSettings;
}
