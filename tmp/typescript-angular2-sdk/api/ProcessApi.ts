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
export class ProcessApi {
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
     */
    public cancelProcess (id: string, extraHttpRequestParams?: any ) : Observable<{}> {
        const path = this.basePath + '/api/Processes/{id}/Cancel'
            .replace('{' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling cancelProcess.');
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
     */
    public getProcess (id: string, extraHttpRequestParams?: any ) : Observable<models.IProcess> {
        const path = this.basePath + '/api/Processes/{id}'
            .replace('{' + 'id' + '}', String(id));

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling getProcess.');
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
     * @param allStatus 
     * @param allTime 
     */
    public getProcesses (allStatus?: boolean, allTime?: boolean, extraHttpRequestParams?: any ) : Observable<Array<models.IProcess>> {
        const path = this.basePath + '/api/Processes';

        let queryParameters = new URLSearchParams();
        let headerParams = this.defaultHeaders;
        if (allStatus !== undefined) {
            queryParameters.set('allStatus', String(allStatus));
        }

        if (allTime !== undefined) {
            queryParameters.set('allTime', String(allTime));
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

}
