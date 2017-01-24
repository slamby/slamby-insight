import * as models from './models';
export interface ISearchResultWrapper {
    AutoCompleteResultList?: Array<models.IAutoCompleteResult>;
    ClassifierResultList?: Array<models.IClassifierRecommendationResult>;
    SearchResultList?: Array<models.ISearchResult>;
}
