import * as models from './models';
export interface ISearchSettings {
    Filter?: models.IFilter;
    Weights?: Array<models.IWeight>;
    ResponseFieldList?: Array<string>;
    SearchFieldList?: Array<string>;
    Type?: ISearchSettings.ITypeEnum;
    CutOffFrequency?: number;
    Fuzziness?: number;
    Count?: number;
    Operator?: ISearchSettings.IOperatorEnum;
}
export declare namespace ISearchSettings {
    enum ITypeEnum {
        Match,
        Query,
    }
    enum IOperatorEnum {
        AND,
        OR,
    }
}
