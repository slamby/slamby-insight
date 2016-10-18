import {Component, Input} from '@angular/core';

@Component({
    selector: 'DocumentDetails',
    template: require('./document-details.component.html'),
    styles: [require('./document-details.component.scss')]
})
export class DocumentDetailsComponent {
    static pageTitle: string = 'DocumentDetails';
    static pageIcon: string = 'fa-file';

    private _document: any;
    @Input() set document(doc: any) {
        this.properties = [];
        Object.keys(doc).forEach(prop => {
            this.properties.push({
                Key: prop,
                Value: this.jsonStringify(doc[prop])
            });
        });
        this._document = doc;
    };

    properties: Array<any> = [];

    get document() {
        return this._document;
    }

    isMultiline(text: string) {
        return (text.match(/\n|\\n/g) || []).length > 0;
    }

    replaceNewLines(text: string): string {
        return text.replace(/(?:\\r\\n|\\r|\\n)/g, '<br>');
    }

    jsonStringify(obj: any): string {
        let text = JSON.stringify(obj, null, 4);

        if (text.length > 1 && text[0] === '"') {
            text = text.slice(1, text.length - 1);
        }

        return text;
    }
}
