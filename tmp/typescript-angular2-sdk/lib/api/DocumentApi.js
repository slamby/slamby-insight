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
var DocumentApi = (function () {
    function DocumentApi(http, basePath) {
        this.http = http;
        this.basePath = 'https://localhost/';
        this.defaultHeaders = new http_1.Headers();
        if (basePath) {
            this.basePath = basePath;
        }
    }
    DocumentApi.prototype.bulkDocuments = function (settings, extraHttpRequestParams) {
        var path = this.basePath + '/api/Documents/Bulk';
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
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
    DocumentApi.prototype.copyDocuments = function (copySettings, extraHttpRequestParams) {
        var path = this.basePath + '/api/Documents/Copy';
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(copySettings);
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
    DocumentApi.prototype.createDocument = function (document, extraHttpRequestParams) {
        var path = this.basePath + '/api/Documents';
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(document);
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
    DocumentApi.prototype.deleteDocument = function (id, extraHttpRequestParams) {
        var path = this.basePath + '/api/Documents/{id}'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling deleteDocument.');
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
    DocumentApi.prototype.getDocument = function (id, extraHttpRequestParams) {
        var path = this.basePath + '/api/Documents/{id}'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling getDocument.');
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
    DocumentApi.prototype.getFilteredDocuments = function (scrollId, filterSettings, extraHttpRequestParams) {
        var path = this.basePath + '/api/Documents/Filter/{scrollId}'
            .replace('{' + 'scrollId' + '}', String(scrollId));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (scrollId === null || scrollId === undefined) {
            throw new Error('Required parameter scrollId was null or undefined when calling getFilteredDocuments.');
        }
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(filterSettings);
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
    DocumentApi.prototype.getSampleDocuments = function (sampleSettings, extraHttpRequestParams) {
        var path = this.basePath + '/api/Documents/Sample';
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(sampleSettings);
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
    DocumentApi.prototype.moveDocuments = function (moveSettings, extraHttpRequestParams) {
        var path = this.basePath + '/api/Documents/Move';
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        var requestOptions = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(moveSettings);
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
    DocumentApi.prototype.updateDocument = function (id, document, extraHttpRequestParams) {
        var path = this.basePath + '/api/Documents/{id}'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = new http_1.URLSearchParams();
        var headerParams = this.defaultHeaders;
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling updateDocument.');
        }
        var requestOptions = {
            method: 'PUT',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(document);
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
    DocumentApi = __decorate([
        core_1.Injectable(),
        __param(1, core_1.Optional()), 
        __metadata('design:paramtypes', [http_1.Http, String])
    ], DocumentApi);
    return DocumentApi;
}());
exports.DocumentApi = DocumentApi;
//# sourceMappingURL=DocumentApi.js.map