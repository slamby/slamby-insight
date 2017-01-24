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
var ServiceApi = (function () {
    function ServiceApi(http, basePath) {
        this.http = http;
        this.basePath = 'https://localhost/';
        this.defaultHeaders = new http_1.Headers();
        if (basePath) {
            this.basePath = basePath;
        }
    }
    ServiceApi.prototype.createService = function (service, extraHttpRequestParams) {
        var path = this.basePath + '/api/Services';
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(service);
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
    ServiceApi.prototype.deleteService = function (id, extraHttpRequestParams) {
        var path = this.basePath + '/api/Services/{id}'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling deleteService.');
        }
        var requestOptions = {
            method: 'DELETE',
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
    ServiceApi.prototype.getService = function (id, extraHttpRequestParams) {
        var path = this.basePath + '/api/Services/{id}'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling getService.');
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
    ServiceApi.prototype.getServices = function (extraHttpRequestParams) {
        var path = this.basePath + '/api/Services';
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
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
    ServiceApi.prototype.updateService = function (id, service, extraHttpRequestParams) {
        var path = this.basePath + '/api/Services/{id}'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling updateService.');
        }
        var requestOptions = {
            method: 'PUT',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(service);
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
    ServiceApi = __decorate([
        core_1.Injectable(),
        __param(1, core_1.Optional()), 
        __metadata('design:paramtypes', [http_1.Http, String])
    ], ServiceApi);
    return ServiceApi;
}());
exports.ServiceApi = ServiceApi;
//# sourceMappingURL=ServiceApi.js.map