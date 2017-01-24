import * as models from './models';
export interface ITag {
    Id?: string;
    Name?: string;
    ParentId?: string;
    Properties?: models.ITagProperties;
}
