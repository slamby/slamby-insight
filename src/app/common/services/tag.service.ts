import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { TagApi, IBulkResults, ITagBulkSettings, ITag, ITagsExportWordsSettings, IProcess } from 'slamby-sdk-angular2';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

import { OptionService } from './option.service';
import { BaseService } from './base.service';

@Injectable()
export class TagService extends BaseService<TagApi> {

    constructor(private optionService: OptionService, private _http: Http) {
        super(new TagApi(_http, optionService.currentEndpoint.ApiBaseEndpoint), optionService.currentEndpoint);
    }

    getTags(dataset: string, withDetails = true): Observable<ITag[]> {
        this.clearContentTypeHeader();
        this.setDataSetHeader(dataset);
        return this.apiService.getTags(withDetails);
    }

    bulkImport(dataset: string, tags: Array<ITag>): Observable<IBulkResults> {
        this.setContentTypeHeader();
        this.setDataSetHeader(dataset);
        let setting: ITagBulkSettings = {
            Tags: tags
        };
        return this.apiService.bulkTags(setting);
    }

    deleteTag(dataset: string, id: string): Observable<{}> {
        this.clearContentTypeHeader();
        this.setDataSetHeader(dataset);
        return this.apiService.deleteTag(id);
    }

    createTag(dataset: string, tag: ITag): Observable<ITag> {
        this.setContentTypeHeader();
        this.setDataSetHeader(dataset);
        return this.apiService.createTag(tag);
    }

    updateTag(dataset: string, id: string, tag: ITag): Observable<{}> {
        this.setContentTypeHeader();
        this.setDataSetHeader(dataset);
        return this.apiService.updateTag(id, tag);
    }

    exportWords(dataset: string, settings: ITagsExportWordsSettings): Observable<IProcess> {
        this.setContentTypeHeader();
        this.setDataSetHeader(dataset);
        return this.apiService.wordsExport(settings);
    }
}
