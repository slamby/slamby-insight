import * as models from './models';
export interface ITagProperties {
    Paths?: Array<models.IPathItem>;
    Level?: number;
    IsLeaf?: boolean;
    DocumentCount?: number;
    WordCount?: number;
}
