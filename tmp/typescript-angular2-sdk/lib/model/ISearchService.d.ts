import * as models from './models';
export interface ISearchService {
    PrepareSettings?: models.ISearchPrepareSettings;
    ActivateSettings?: models.ISearchActivateSettings;
    Id?: string;
    Name?: string;
    Alias?: string;
    Description?: string;
    Status?: ISearchService.IStatusEnum;
    Type?: ISearchService.ITypeEnum;
    ProcessIdList?: Array<string>;
    ActualProcessId?: string;
}
export declare namespace ISearchService {
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
