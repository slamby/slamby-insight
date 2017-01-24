import * as models from './models';
export interface ISearchRequest {
    Text?: string;
    AutoCompleteSettings?: models.IAutoCompleteSettings;
    SearchSettings?: models.ISearchSettings;
    ClassifierSettings?: models.IClassifierSettings;
}
