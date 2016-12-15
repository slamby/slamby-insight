import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'convertTextToUrl' })
export class ConvertTextToUrl implements PipeTransform {
    transform(text: string): string {
        if (!text) {
            return;
        }
        return this.linkify(text);
    }

    private linkify(plainText: string): string {
        if (plainText.replace === undefined) {
            return plainText;
        }
        let replacedText;
        let replacePattern1;
        let replacePattern2;

        // URLs starting with http://, https://, or ftp://
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = plainText.replace(replacePattern1, '<a href="$1">$1</a>');

        // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2">$2</a>');

        // Change email addresses to mailto:: links.
        // replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        // replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

        return replacedText;
    }
}
