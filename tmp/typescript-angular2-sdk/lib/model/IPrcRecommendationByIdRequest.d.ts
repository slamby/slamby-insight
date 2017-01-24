import * as models from './models';
export interface IPrcRecommendationByIdRequest {
    DocumentId?: string;
    Query?: string;
    Count?: number;
    NeedDocumentInResult?: boolean;
    TagId?: string;
    Weights?: Array<models.IWeight>;
}
