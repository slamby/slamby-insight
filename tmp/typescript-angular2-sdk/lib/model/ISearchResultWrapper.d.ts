import * as models from './models';
export interface ISearchResultWrapper {
    AutoCompleteResultList?: Array<models.IAutoCompleteResult>;
    ClassifierResultList?: Array<models.ISearchClassifierRecommendationResult>;
    SearchResultList?: Array<models.ISearchResult>;
}
