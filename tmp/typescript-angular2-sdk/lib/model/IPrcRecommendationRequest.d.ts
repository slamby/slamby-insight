import * as models from './models';
export interface IPrcRecommendationRequest {
    Text?: string;
    Filter?: models.IFilter;
    Count?: number;
    NeedDocumentInResult?: boolean;
    TagId?: string;
    Weights?: Array<models.IWeight>;
}
