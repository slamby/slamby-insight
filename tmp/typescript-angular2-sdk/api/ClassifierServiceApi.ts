/**
 * Slamby API
 * Slamby API
 *
 * OpenAPI spec version: 1.4.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Http, Headers, RequestOptionsArgs, Response, URLSearchParams} from '@angular/http';
import {Injectable, Optional} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import * as models from '../model/models';
import 'rxjs/Rx';

/* tslint:disable:no-unused-variable member-ordering */

'use strict';

@Injectable()
export class ClassifierServiceApi {
    protected basePath = 'https://localhost/';
    public defaultHeaders : Headers = new Headers();

    constructor(protected http: Http, @Optional() basePath: string) {
        if (basePath) {
            this.basePath = basePath;
        }
    }

    /**
     * 
     * 
     * @param id 
     * @param classifierActivateSettings 
     */
    public classifierActivateService (id: string, classifierActivateSettings?: models.IClassifierActivateSettings, extraHttpRequestParams?: any ) : Observable<models.IProcess> {
        const path = this.basePath + '/api/Services/Classifier/{id}/Activate'
            .replace('{' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierActivateService.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(classifierActivateSettings);

        return this.http.request(path, requestOptions)
            .map((response: Response) => {
                if (response.status === 204) {
                    return undefined;
                } else {
                    return response.text() ? response.json() : undefined;
                }
            });
    }

    /**
     * 
     * 
     * @param id 
     */
    public classifierDeactivateService (id: string, extraHttpRequestParams?: any ) : Observable<{}> {
        const path = this.basePath + '/api/Services/Classifier/{id}/Deactivate'
            .replace('{' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierDeactivateService.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };

        return this.http.request(path, requestOptions)
            .map((response: Response) => {
                if (response.status === 204) {
                    return undefined;
                } else {
                    return response.text() ? response.json() : undefined;
                }
            });
    }

    /**
     * 
     * 
     * @param id 
     * @param settings 
     */
    public classifierExportDictionaries (id: string, settings?: models.IExportDictionariesSettings, extraHttpRequestParams?: any ) : Observable<models.IProcess> {
        const path = this.basePath + '/api/Services/Classifier/{id}/ExportDictionaries'
            .replace('{' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierExportDictionaries.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(settings);

        return this.http.request(path, requestOptions)
            .map((response: Response) => {
                if (response.status === 204) {
                    return undefined;
                } else {
                    return response.text() ? response.json() : undefined;
                }
            });
    }

    /**
     * 
     * 
     * @param id 
     */
    public classifierGetService (id: string, extraHttpRequestParams?: any ) : Observable<models.IClassifierService> {
        const path = this.basePath + '/api/Services/Classifier/{id}'
            .replace('{' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierGetService.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: 'GET',
            headers: headerParams,
            search: queryParameters
        };

        return this.http.request(path, requestOptions)
            .map((response: Response) => {
                if (response.status === 204) {
                    return undefined;
                } else {
                    return response.text() ? response.json() : undefined;
                }
            });
    }

    /**
     * 
     * 
     * @param id 
     * @param classifierPrepareSettings 
     */
    public classifierPrepareService (id: string, classifierPrepareSettings?: models.IClassifierPrepareSettings, extraHttpRequestParams?: any ) : Observable<models.IProcess> {
        const path = this.basePath + '/api/Services/Classifier/{id}/Prepare'
            .replace('{' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierPrepareService.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(classifierPrepareSettings);

        return this.http.request(path, requestOptions)
            .map((response: Response) => {
                if (response.status === 204) {
                    return undefined;
                } else {
                    return response.text() ? response.json() : undefined;
                }
            });
    }

    /**
     * 
     * 
     * @param id 
     * @param request 
     */
    public classifierRecommendService (id: string, request?: models.IClassifierRecommendationRequest, extraHttpRequestParams?: any ) : Observable<Array<models.IClassifierRecommendationResult>> {
        const path = this.basePath + '/api/Services/Classifier/{id}/Recommend'
            .replace('{' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling classifierRecommendService.');
        }
        let requestOptions: RequestOptionsArgs = {
            method: 'POST',
            headers: headerParams,
            search: queryParameters
        };
        requestOptions.body = JSON.stringify(request);

        return this.http.request(path, requestOptions)
            .map((response: Response) => {
                if (response.status === 204) {
                    return undefined;
                } else {
                    return response.text() ? response.json() : undefined;
                }
            });
    }

}
