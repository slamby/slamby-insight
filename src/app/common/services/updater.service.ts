import { Injectable } from '@angular/core';
import { Http, Response, RequestOptionsArgs, Headers } from '@angular/http';

import { StatusService } from './status.service';
import { OptionService } from './option.service';
import { ErrorsModelHelper } from '../helpers/errorsmodel.helper';

@Injectable()
export class UpdaterService {

    private releaseUrl: string = 'https://api.github.com/repos/slamby/slamby-api/releases/latest';
    private get updateUrl(): string {
        return `${this.optionService.currentEndpoint.ApiBaseEndpoint}/update`;
    }

    constructor(private http: Http,
        private statusService: StatusService,
        private optionService: OptionService) {
    }

    async checkNewerVersion(): Promise<UpdaterResult> {
        try {
            let updatable = await this.hasUpdateEndpoint();
            let latestReleaseVersion = (await this.getLatestApiVersion()).slice(1);
            let currentApiVersion = await this.getApiVersion();
            let newerVersion = latestReleaseVersion !== currentApiVersion ? latestReleaseVersion : '';

            return Promise.resolve<UpdaterResult>(<UpdaterResult>{ updateVersion : newerVersion, updatable: updatable });
        } catch (error) {
            return Promise.reject<UpdaterResult>(error);
        }
    }

    async updateApiServer(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let headers = new Headers();

            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', `Slamby ${this.optionService.currentEndpoint.ApiSecret}`);

            let requestOptions: RequestOptionsArgs = {
                method: 'POST',
                headers: headers
            };
            let url = this.updateUrl;

            this.http.request(url, requestOptions)
                .subscribe(
                    (response: Response) => resolve(response.json()),
                    (error: Response | any) => {
                        if (error instanceof Response) {
                            let errorsModel = ErrorsModelHelper.getFromResponse(error);
                            let errors = ErrorsModelHelper.concatErrors(errorsModel, ' ');
                            reject(errors);
                        }
                        reject(error);
                    });
        });
    }

    private async hasUpdateEndpoint(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.http.get(this.updateUrl)
                .subscribe(
                    (response: Response) => resolve(response.status === 200),
                    (error: Response | any) => resolve(false));
        });
    }

    private async getLatestApiVersion(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.http.get(this.releaseUrl)
                .subscribe(
                    (response: Response) => resolve(response.json().tag_name),
                    (error: Response | any) => reject(new Error('Failed to get latest API version')));
        });
    }

    private async getApiVersion(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.statusService.getStatus()
                .subscribe(
                response => resolve(response.ApiVersion),
                error => reject(new Error('Failed to get API status')));
        });
    }
}

export class UpdaterResult {
    updateVersion: string;
    updatable: boolean;
}
