import * as models from './models';
export interface IClassifierService {
    PrepareSettings?: models.IClassifierPrepareSettings;
    ActivateSettings?: models.IClassifierActivateSettings;
    Id?: string;
    Name?: string;
    Alias?: string;
    Description?: string;
    Status?: IClassifierService.IStatusEnum;
    Type?: IClassifierService.ITypeEnum;
    ProcessIdList?: Array<string>;
    ActualProcessId?: string;
}
export declare namespace IClassifierService {
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
