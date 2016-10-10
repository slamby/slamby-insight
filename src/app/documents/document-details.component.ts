import {Component, Input} from '@angular/core';

//      <prettyjson [obj]="document" [horizontalScroll]="'pre'"></prettyjson>
@Component({
    selector: 'DocumentDetails',
    template: `
    <div class="table-responsive">
        <table >
            <tbody>
                <tr *ngFor='let property of properties'>
                    <td>
                        <label>{{property.Key}}: </label>
                    </td>
                    <td style="width: 100%">
                        <p *ngIf="!isMultiline(property.Value)">
                            {{property.Value}}
                        </p>
                        <pre *ngIf="isMultiline(property.Value)" [innerHtml]="replaceNewLines(property.Value)" style="width: 100%">
                        </pre>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `,
styles: [`
    pre {
        background-color: inherit;
        border: none;
        font-family: inherit;
        font-size: inherit;
        padding: 0;
    }
    .string { color: green; }
    .number { color: darkorange; }
    .boolean { color: blue; }
    .null { color: magenta; }
    .key { color: red; }
`]
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
