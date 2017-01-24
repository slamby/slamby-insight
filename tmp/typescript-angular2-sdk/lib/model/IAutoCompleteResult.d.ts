import * as models from './models';
export interface IAutoCompleteResult {
    Text?: string;
    Score?: number;
    ClassifierResultList?: Array<models.IClassifierRecommendationResult>;
}
