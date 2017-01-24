'use strict';
var IClassifierService;
(function (IClassifierService) {
    (function (IStatusEnum) {
        IStatusEnum[IStatusEnum["New"] = 'New'] = "New";
        IStatusEnum[IStatusEnum["Busy"] = 'Busy'] = "Busy";
        IStatusEnum[IStatusEnum["Prepared"] = 'Prepared'] = "Prepared";
        IStatusEnum[IStatusEnum["Active"] = 'Active'] = "Active";
    })(IClassifierService.IStatusEnum || (IClassifierService.IStatusEnum = {}));
    var IStatusEnum = IClassifierService.IStatusEnum;
    (function (ITypeEnum) {
        ITypeEnum[ITypeEnum["Classifier"] = 'Classifier'] = "Classifier";
        ITypeEnum[ITypeEnum["Prc"] = 'Prc'] = "Prc";
        ITypeEnum[ITypeEnum["Search"] = 'Search'] = "Search";
    })(IClassifierService.ITypeEnum || (IClassifierService.ITypeEnum = {}));
    var ITypeEnum = IClassifierService.ITypeEnum;
})(IClassifierService = exports.IClassifierService || (exports.IClassifierService = {}));
//# sourceMappingURL=IClassifierService.js.map