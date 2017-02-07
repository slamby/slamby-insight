import { Component, OnInit } from '@angular/core';
import { Response } from '@angular/http';

import { StatisticsService } from '../common/services/statistics.service';
import { IStatisticsWrapper, IStatistics, IAction } from 'slamby-sdk-angular2';
import { Observable } from 'rxjs/Observable';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';

import * as _ from 'lodash';

@Component({
    template: require('./statistics.component.html')
})

export class StatisticsComponent implements OnInit {
    static pageTitle: string = 'Statistics';
    static pageIcon: string = 'fa-bar-chart';
    errorMessage: string;
    statisticsWrapper: IStatisticsWrapper;
    statistics: { [key: string]: IStatistics; };
    periods: string[];
    selectedPeriod: string;
    selectedPeriodSum: number;
    sum: number;
    endpointFilter: string;


    constructor(public statisticsService: StatisticsService) {
    }

    ngOnInit(): void {
        this.getStatistics();
    }

    getStatistics() {
        this.statisticsService.getStatistics()
            .subscribe(
            statWrapper => {
                this.errorMessage = '';
                this.sum = statWrapper.Sum;
                this.statistics = statWrapper.Statistics;
                this.periods = Object.keys(this.statistics);
                this.selectedPeriod = this.periods[this.periods.length - 1];
                this.selectedPeriodSum = this.statistics[this.selectedPeriod].Sum;
            },
            error => this.handleError(error));
    }

    handleError(response: Response) {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this.errorMessage = errors;
    }

    selectedStatisticsActions() {
        if (!this.selectedPeriod || !this.statistics) {
            return null;
        }
        this.selectedPeriodSum = this.statistics[this.selectedPeriod].Sum;
        if (!this.endpointFilter) {
            return this.statistics[this.selectedPeriod].Actions;
        } else {
            return this.statistics[this.selectedPeriod].Actions.filter(item =>
                item.Name.toLowerCase().indexOf(this.endpointFilter.toLowerCase()) !== -1);
        }
    }
}
