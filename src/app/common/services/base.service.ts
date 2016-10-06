import {  Headers } from '@angular/http';
import { Endpoint } from '../../models/endpoint';

export class BaseService<TApiService> {

    protected apiService: TApiService;
    protected headers: Headers;

    constructor(apiService: TApiService, endpoint: Endpoint) {
        this.initialize(apiService, endpoint);
    }

    initialize(apiService: TApiService, endpoint: Endpoint) {
        if (!apiService || !endpoint) {
            return;
        }

        this.apiService = apiService;
        this.headers = (<any>this.apiService).defaultHeaders;
        this.setAuthorizationHeader(endpoint.ApiSecret);
        this.setParallelLimitHeader(endpoint.ParallelLimit);
    }

    clearContentTypeHeader() {
        if (this.headers.has('Content-Type')) {
            this.headers.delete('Content-Type');
        }
    }

    setContentTypeHeader() {
        if (!this.headers.has('Content-Type')) {
            this.headers.append('Content-Type', 'application/json');
        }
    }

    setDataSetHeader(dataSetName: string) {
        this.headers.delete('X-DataSet');
        this.headers.append('X-DataSet', dataSetName);
    }

    setAuthorizationHeader(secret: string) {
        this.headers.append('Authorization', `Slamby ${secret}`);
    }

    setParallelLimitHeader(parallelLimit: number) {
        this.headers.append('X-Api-Parallel-Limit', parallelLimit.toString());
    }
}
