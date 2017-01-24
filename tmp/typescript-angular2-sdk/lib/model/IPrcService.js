'use strict';
var IPrcService;
(function (IPrcService) {
    (function (IStatusEnum) {
        IStatusEnum[IStatusEnum["New"] = 'New'] = "New";
        IStatusEnum[IStatusEnum["Busy"] = 'Busy'] = "Busy";
        IStatusEnum[IStatusEnum["Prepared"] = 'Prepared'] = "Prepared";
        IStatusEnum[IStatusEnum["Active"] = 'Active'] = "Active";
    })(IPrcService.IStatusEnum || (IPrcService.IStatusEnum = {}));
    var IStatusEnum = IPrcService.IStatusEnum;
    (function (ITypeEnum) {
        ITypeEnum[ITypeEnum["Classifier"] = 'Classifier'] = "Classifier";
        ITypeEnum[ITypeEnum["Prc"] = 'Prc'] = "Prc";
        ITypeEnum[ITypeEnum["Search"] = 'Search'] = "Search";
    })(IPrcService.ITypeEnum || (IPrcService.ITypeEnum = {}));
    var ITypeEnum = IPrcService.ITypeEnum;
})(IPrcService = exports.IPrcService || (exports.IPrcService = {}));
//# sourceMappingURL=IPrcService.js.map