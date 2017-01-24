import * as models from './models';
export interface IDocumentFilterSettings {
    Pagination?: models.IPagination;
    Order?: models.IOrder;
    Filter?: models.IFilter;
    FieldList?: Array<string>;
}
