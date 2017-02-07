import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { StatisticsApi, IStatisticsWrapper } from 'slamby-sdk-angular2';
import { OptionService } from './option.service';
import { BaseService } from './base.service';

@Injectable()
export class StatisticsService extends BaseService<StatisticsApi> {
    constructor(private optionService: OptionService, private _http: Http) {
        super(new StatisticsApi(_http, optionService.currentEndpoint.ApiBaseEndpoint), optionService.currentEndpoint);
    }

    getStatistics(year?: number, month?: number): Observable<IStatisticsWrapper> {
        if (!year) {
            return this.apiService.getStatistics();
        } else if (year && !month) {
            return this.apiService.getStatistics_1(year);
        } else if (year && month) {
            return this.apiService.getStatistics_2(year, month);
        }
        return null;
    }

}

