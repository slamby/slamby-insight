import * as models from './models';
export interface IClassifierRecommendationResult {
    TagId?: string;
    Score?: number;
    Tag?: models.ITag;
    IsEmphasized?: boolean;
}
