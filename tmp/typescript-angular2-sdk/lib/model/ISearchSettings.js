'use strict';
var ISearchSettings;
(function (ISearchSettings) {
    (function (ITypeEnum) {
        ITypeEnum[ITypeEnum["Match"] = 'Match'] = "Match";
        ITypeEnum[ITypeEnum["Query"] = 'Query'] = "Query";
    })(ISearchSettings.ITypeEnum || (ISearchSettings.ITypeEnum = {}));
    var ITypeEnum = ISearchSettings.ITypeEnum;
    (function (IOperatorEnum) {
        IOperatorEnum[IOperatorEnum["AND"] = 'AND'] = "AND";
        IOperatorEnum[IOperatorEnum["OR"] = 'OR'] = "OR";
    })(ISearchSettings.IOperatorEnum || (ISearchSettings.IOperatorEnum = {}));
    var IOperatorEnum = ISearchSettings.IOperatorEnum;
})(ISearchSettings = exports.ISearchSettings || (exports.ISearchSettings = {}));
//# sourceMappingURL=ISearchSettings.js.map