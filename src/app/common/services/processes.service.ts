import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { IProcess, ProcessApi } from 'slamby-sdk-angular2';
import { OptionService } from './option.service';
import { BaseService } from './base.service';

@Injectable()
export class ProcessesService extends BaseService<ProcessApi> {
    constructor(private optionService: OptionService, private _http: Http) {
        super(new ProcessApi(_http, optionService.currentEndpoint.ApiBaseEndpoint), optionService.currentEndpoint);
    }

    getProcesses(allStatus?: boolean): Observable<Array<IProcess>> {
        return this.apiService.getProcesses(allStatus);
    }

    getProcess(id: string): Observable<IProcess> {
        return this.apiService.getProcess(id);
    }

    cancel(id: string): any {
        return this.apiService.cancelProcess(id);
    }
}
