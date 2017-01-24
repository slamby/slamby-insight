export interface ICompressSettings {
    CategoryOccurence?: number;
    DataSetOccurence?: number;
    Operator?: ICompressSettings.IOperatorEnum;
}
export declare namespace ICompressSettings {
    enum IOperatorEnum {
        AND,
        OR,
    }
}
