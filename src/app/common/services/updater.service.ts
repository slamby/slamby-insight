import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { StatusService} from './status.service';
import { OptionService } from './option.service';

@Injectable()
export class UpdaterService {

    releaseUrl: string = 'https://api.github.com/repos/slamby/slamby-api/releases/latest'; 

    constructor(private http: Http, 
        private statusService: StatusService,
        private optionService: OptionService) {
    }

    async checkNewerVersion(): Promise<IUpdaterResult> {
        try {
            let updatable = await this.hasUpdateEndpoint();
            let latestReleaseVersion = (await this.getLatestApiVersion()).slice(1);
            let currentApiVersion = await this.getApiVersion();
            let newerVersion = latestReleaseVersion !== currentApiVersion ? latestReleaseVersion : '';

            return Promise.resolve<IUpdaterResult>(<IUpdaterResult>{ updateVersion : newerVersion, updatable: updatable }); 
        } catch (error) {
            return Promise.reject<IUpdaterResult>(error) 
        }
    }

    private async hasUpdateEndpoint(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let url = `${this.optionService.currentEndpoint.ApiBaseEndpoint}/update`;
            this.http.get(url)
                .subscribe(
                    (data: Response) => {
                        resolve(data.status === 200)
                    },
                    (e) => {
                        resolve(false)
                    });
        });
    }

    private async getLatestApiVersion(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.http.get(this.releaseUrl)
                .subscribe(
                    (data: any) => resolve(data.json().tag_name),
                    (e) => reject(new Error('Failed to get latest API version')));
        });
    }

    private async getApiVersion(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.statusService.getStatus()
                .subscribe(
                status => resolve(status.ApiVersion),
                error => reject(new Error('Failed to get API status')));
        });
    }
}

export interface IUpdaterResult {
    updateVersion: string;
    updatable: boolean;
}