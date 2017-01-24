'use strict';
var IProcess;
(function (IProcess) {
    (function (IStatusEnum) {
        IStatusEnum[IStatusEnum["InProgress"] = 'InProgress'] = "InProgress";
        IStatusEnum[IStatusEnum["Cancelled"] = 'Cancelled'] = "Cancelled";
        IStatusEnum[IStatusEnum["Finished"] = 'Finished'] = "Finished";
        IStatusEnum[IStatusEnum["Error"] = 'Error'] = "Error";
        IStatusEnum[IStatusEnum["Interrupted"] = 'Interrupted'] = "Interrupted";
        IStatusEnum[IStatusEnum["Paused"] = 'Paused'] = "Paused";
        IStatusEnum[IStatusEnum["Cancelling"] = 'Cancelling'] = "Cancelling";
    })(IProcess.IStatusEnum || (IProcess.IStatusEnum = {}));
    var IStatusEnum = IProcess.IStatusEnum;
    (function (ITypeEnum) {
        ITypeEnum[ITypeEnum["ClassifierPrepare"] = 'ClassifierPrepare'] = "ClassifierPrepare";
        ITypeEnum[ITypeEnum["PrcPrepare"] = 'PrcPrepare'] = "PrcPrepare";
        ITypeEnum[ITypeEnum["ClassifierExportDictionaries"] = 'ClassifierExportDictionaries'] = "ClassifierExportDictionaries";
        ITypeEnum[ITypeEnum["PrcExportDictionaries"] = 'PrcExportDictionaries'] = "PrcExportDictionaries";
        ITypeEnum[ITypeEnum["TagsExportWords"] = 'TagsExportWords'] = "TagsExportWords";
        ITypeEnum[ITypeEnum["ClassifierActivate"] = 'ClassifierActivate'] = "ClassifierActivate";
        ITypeEnum[ITypeEnum["PrcActivate"] = 'PrcActivate'] = "PrcActivate";
        ITypeEnum[ITypeEnum["PrcIndex"] = 'PrcIndex'] = "PrcIndex";
        ITypeEnum[ITypeEnum["PrcIndexPartial"] = 'PrcIndexPartial'] = "PrcIndexPartial";
        ITypeEnum[ITypeEnum["DocumentsCopy"] = 'DocumentsCopy'] = "DocumentsCopy";
        ITypeEnum[ITypeEnum["DocumentsMove"] = 'DocumentsMove'] = "DocumentsMove";
        ITypeEnum[ITypeEnum["SearchPrepare"] = 'SearchPrepare'] = "SearchPrepare";
        ITypeEnum[ITypeEnum["SearchActivate"] = 'SearchActivate'] = "SearchActivate";
    })(IProcess.ITypeEnum || (IProcess.ITypeEnum = {}));
    var ITypeEnum = IProcess.ITypeEnum;
})(IProcess = exports.IProcess || (exports.IProcess = {}));
//# sourceMappingURL=IProcess.js.map