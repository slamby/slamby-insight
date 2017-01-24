export interface IService {
    Id?: string;
    Name?: string;
    Alias?: string;
    Description?: string;
    Status?: IService.IStatusEnum;
    Type?: IService.ITypeEnum;
    ProcessIdList?: Array<string>;
    ActualProcessId?: string;
}
export declare namespace IService {
    enum IStatusEnum {
        New,
        Busy,
        Prepared,
        Active,
    }
    enum ITypeEnum {
        Classifier,
        Prc,
        Search,
    }
}
