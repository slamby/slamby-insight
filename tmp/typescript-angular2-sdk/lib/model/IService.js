'use strict';
var IService;
(function (IService) {
    (function (IStatusEnum) {
        IStatusEnum[IStatusEnum["New"] = 'New'] = "New";
        IStatusEnum[IStatusEnum["Busy"] = 'Busy'] = "Busy";
        IStatusEnum[IStatusEnum["Prepared"] = 'Prepared'] = "Prepared";
        IStatusEnum[IStatusEnum["Active"] = 'Active'] = "Active";
    })(IService.IStatusEnum || (IService.IStatusEnum = {}));
    var IStatusEnum = IService.IStatusEnum;
    (function (ITypeEnum) {
        ITypeEnum[ITypeEnum["Classifier"] = 'Classifier'] = "Classifier";
        ITypeEnum[ITypeEnum["Prc"] = 'Prc'] = "Prc";
        ITypeEnum[ITypeEnum["Search"] = 'Search'] = "Search";
    })(IService.ITypeEnum || (IService.ITypeEnum = {}));
    var ITypeEnum = IService.ITypeEnum;
})(IService = exports.IService || (exports.IService = {}));
//# sourceMappingURL=IService.js.map