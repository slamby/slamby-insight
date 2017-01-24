import * as models from './models';
export interface IPrcService {
    PrepareSettings?: models.IPrcPrepareSettings;
    ActivateSettings?: models.IPrcActivateSettings;
    IndexSettings?: models.IPrcIndexSettings;
    Id?: string;
    Name?: string;
    Alias?: string;
    Description?: string;
    Status?: IPrcService.IStatusEnum;
    Type?: IPrcService.ITypeEnum;
    ProcessIdList?: Array<string>;
    ActualProcessId?: string;
}
export declare namespace IPrcService {
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
