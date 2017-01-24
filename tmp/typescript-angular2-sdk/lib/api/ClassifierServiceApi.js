"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var http_1 = require('@angular/http');
var core_1 = require('@angular/core');
require('rxjs/Rx');
'use strict';
var ClassifierServiceApi = (function () {
    function ClassifierServiceApi(http, basePath) {
        this.http = http;
        this.basePath = 'https://localhost/';
        this.defaultHeaders = new http_1.Headers();
        if (basePath) {
            this.basePath = basePath;
        }
    }
    ClassifierServiceApi.prototype.classifierActivateService = function (id, classifierActivateSettings, extraHttpRequestParams) {
        var path = this.basePath + '/api/Services/Classifier/{id}/Activate'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierActivateService.');
        }
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(classifierActivateSettings);
        return this.http.request(path, requestOptions)
            .map(function (response) {
            if (response.status === 204) {
                return undefined;
            }
            else {
                return response.text() ? response.json() : undefined;
            }
        });
    };
    ClassifierServiceApi.prototype.classifierDeactivateService = function (id, extraHttpRequestParams) {
        var path = this.basePath + '/api/Services/Classifier/{id}/Deactivate'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierDeactivateService.');
        }
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        return this.http.request(path, requestOptions)
            .map(function (response) {
            if (response.status === 204) {
                return undefined;
            }
            else {
                return response.text() ? response.json() : undefined;
            }
        });
    };
    ClassifierServiceApi.prototype.classifierExportDictionaries = function (id, settings, extraHttpRequestParams) {
        var path = this.basePath + '/api/Services/Classifier/{id}/ExportDictionaries'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierExportDictionaries.');
        }
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(settings);
        return this.http.request(path, requestOptions)
            .map(function (response) {
            if (response.status === 204) {
                return undefined;
            }
            else {
                return response.text() ? response.json() : undefined;
            }
        });
    };
    ClassifierServiceApi.prototype.classifierGetService = function (id, extraHttpRequestParams) {
        var path = this.basePath + '/api/Services/Classifier/{id}'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierGetService.');
        }
        var requestOptions = {
            method: 'GET',
            headers: headerParams,
            search: queryParameters
        };
        return this.http.request(path, requestOptions)
            .map(function (response) {
            if (response.status === 204) {
                return undefined;
            }
            else {
                return response.text() ? response.json() : undefined;
            }
        });
    };
    ClassifierServiceApi.prototype.classifierPrepareService = function (id, classifierPrepareSettings, extraHttpRequestParams) {
        var path = this.basePath + '/api/Services/Classifier/{id}/Prepare'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierPrepareService.');
        }
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(classifierPrepareSettings);
        return this.http.request(path, requestOptions)
            .map(function (response) {
            if (response.status === 204) {
                return undefined;
            }
            else {
                return response.text() ? response.json() : undefined;
            }
        });
    };
    ClassifierServiceApi.prototype.classifierRecommendService = function (id, request, extraHttpRequestParams) {
        var path = this.basePath + '/api/Services/Classifier/{id}/Recommend'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierRecommendService.');
        }
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(request);
        return this.http.request(path, requestOptions)
            .map(function (response) {
            if (response.status === 204) {
                return undefined;
            }
            else {
                return response.text() ? response.json() : undefined;
            }
        });
    };
    ClassifierServiceApi = __decorate([
        core_1.Injectable(),
        __param(1, core_1.Optional()), 
        __metadata('design:paramtypes', [http_1.Http, String])
    ], ClassifierServiceApi);
    return ClassifierServiceApi;
}());
exports.ClassifierServiceApi = ClassifierServiceApi;
//# sourceMappingURL=ClassifierServiceApi.js.map