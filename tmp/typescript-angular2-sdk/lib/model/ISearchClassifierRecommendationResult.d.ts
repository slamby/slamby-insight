import * as models from './models';
export interface ISearchClassifierRecommendationResult {
    SearchResultMatch?: boolean;
    TagId?: string;
    Score?: number;
    Tag?: models.ITag;
    IsEmphasized?: boolean;
}
