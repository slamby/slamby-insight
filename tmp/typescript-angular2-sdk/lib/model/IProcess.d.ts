export interface IProcess {
    Id?: string;
    Start?: Date;
    End?: Date;
    Percent?: number;
    Description?: string;
    Status?: IProcess.IStatusEnum;
    Type?: IProcess.ITypeEnum;
    ErrorMessages?: Array<string>;
    ResultMessage?: string;
}
export declare namespace IProcess {
    enum IStatusEnum {
        InProgress,
        Cancelled,
        Finished,
        Error,
        Interrupted,
        Paused,
        Cancelling,
    }
    enum ITypeEnum {
        ClassifierPrepare,
        PrcPrepare,
        ClassifierExportDictionaries,
        PrcExportDictionaries,
        TagsExportWords,
        ClassifierActivate,
        PrcActivate,
        PrcIndex,
        PrcIndexPartial,
        DocumentsCopy,
        DocumentsMove,
        SearchPrepare,
        SearchActivate,
    }
}
