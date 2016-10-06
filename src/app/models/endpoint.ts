export interface Endpoint {
    Id: string;
    ApiBaseEndpoint: string;
    ApiSecret: string;
    ParallelLimit: number;
    BulkSize: number;
    Timeout: any;
}
