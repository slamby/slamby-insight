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
var DataSetApi = (function () {
    function DataSetApi(http, basePath) {
        this.http = http;
        this.basePath = 'https://localhost/';
        this.defaultHeaders = new http_1.Headers();
        if (basePath) {
            this.basePath = basePath;
        }
    }
    DataSetApi.prototype.createDataSet = function (dataSet, extraHttpRequestParams) {
        var path = this.basePath + '/api/DataSets';
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(dataSet);
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
    DataSetApi.prototype.createDataSetSchema = function (dataSet, extraHttpRequestParams) {
        var path = this.basePath + '/api/DataSets/Schema';
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(dataSet);
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
    DataSetApi.prototype.deleteDataSet = function (name, extraHttpRequestParams) {
        var path = this.basePath + '/api/DataSets/{name}'
            .replace('{' + 'name' + '}', String(name));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (name === null || name === undefined) {
            throw new Error('Required parameter name was null or undefined when calling deleteDataSet.');
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
    DataSetApi.prototype.getDataSet = function (name, extraHttpRequestParams) {
        var path = this.basePath + '/api/DataSets/{name}'
            .replace('{' + 'name' + '}', String(name));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (name === null || name === undefined) {
            throw new Error('Required parameter name was null or undefined when calling getDataSet.');
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
    DataSetApi.prototype.getDataSets = function (extraHttpRequestParams) {
        var path = this.basePath + '/api/DataSets';
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
    DataSetApi.prototype.updateDataSet = function (existingName, dataSetUpdate, extraHttpRequestParams) {
        var path = this.basePath + '/api/DataSets/{existingName}'
            .replace('{' + 'existingName' + '}', String(existingName));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (existingName === null || existingName === undefined) {
            throw new Error('Required parameter existingName was null or undefined when calling updateDataSet.');
        }
        var requestOptions = {
            method: 'PUT',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(dataSetUpdate);
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
    DataSetApi = __decorate([
        core_1.Injectable(),
        __param(1, core_1.Optional()), 
        __metadata('design:paramtypes', [http_1.Http, String])
    ], DataSetApi);
    return DataSetApi;
}());
exports.DataSetApi = DataSetApi;
//# sourceMappingURL=DataSetApi.js.map