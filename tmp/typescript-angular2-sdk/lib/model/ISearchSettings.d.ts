import * as models from './models';
export interface ISearchSettings {
    Filter?: models.IFilter;
    UseDefaultFilter?: boolean;
    Weights?: Array<models.IWeight>;
    UseDefaultWeights?: boolean;
    ResponseFieldList?: Array<string>;
    SearchFieldList?: Array<string>;
    Type?: ISearchSettings.ITypeEnum;
    CutOffFrequency?: number;
    Fuzziness?: number;
    Count?: number;
    Operator?: ISearchSettings.IOperatorEnum;
    Order?: models.IOrder;
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
