import { Injectable } from '@angular/core';
import { Endpoint } from '../../models/endpoint';

@Injectable()
export class OptionService {
    currentEndpoint: Endpoint = null;
    updateVersion: string = '';
    updatable: boolean = false;
}
