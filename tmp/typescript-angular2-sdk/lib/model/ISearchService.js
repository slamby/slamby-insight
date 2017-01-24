'use strict';
var ISearchService;
(function (ISearchService) {
    (function (IStatusEnum) {
        IStatusEnum[IStatusEnum["New"] = 'New'] = "New";
        IStatusEnum[IStatusEnum["Busy"] = 'Busy'] = "Busy";
        IStatusEnum[IStatusEnum["Prepared"] = 'Prepared'] = "Prepared";
        IStatusEnum[IStatusEnum["Active"] = 'Active'] = "Active";
    })(ISearchService.IStatusEnum || (ISearchService.IStatusEnum = {}));
    var IStatusEnum = ISearchService.IStatusEnum;
    (function (ITypeEnum) {
        ITypeEnum[ITypeEnum["Classifier"] = 'Classifier'] = "Classifier";
        ITypeEnum[ITypeEnum["Prc"] = 'Prc'] = "Prc";
        ITypeEnum[ITypeEnum["Search"] = 'Search'] = "Search";
    })(ISearchService.ITypeEnum || (ISearchService.ITypeEnum = {}));
    var ITypeEnum = ISearchService.ITypeEnum;
})(ISearchService = exports.ISearchService || (exports.ISearchService = {}));
//# sourceMappingURL=ISearchService.js.map