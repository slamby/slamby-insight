import { Endpoint } from './endpoint';

export interface Globals {
    version: string;
    developmentMode: boolean;
    selectedEndpoint: Endpoint;
}
