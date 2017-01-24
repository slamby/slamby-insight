import * as models from './models';
export interface IDataSet {
    Name?: string;
    NGramCount?: number;
    IdField?: string;
    TagField?: string;
    InterpretedFields?: Array<string>;
    Statistics?: models.IDataSetStats;
    SampleDocument?: any;
    Schema?: any;
}
