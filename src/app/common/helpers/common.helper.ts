export module CommonHelper {
    export function guid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    export function escapeJson(jsonString: string): string {
        let escaped = jsonString.replace(/[\n]/g, ' ').replace(/[\r]/g, '');
        return escaped;
    }

    export function toBase64(text: string): string {
        // // Node.js version
        // // Buffer() requires a number, array or string as the first parameter, and an optional encoding type as the second parameter. 
        // // Default is utf8, possible encoding types are ascii, utf8, ucs2, base64, binary, and hex
        // let buffer = new Buffer('JavaScript');
        // // If we don't use toString(), JavaScript assumes we want to convert the object to utf8.
        // // We can make it convert to other formats by passing the encoding type to toString().
        // let base64 = buffer.toString('base64');

        // return base64;

        return btoa(text);
    }

    export function fromBase64(base64: string): string {
        // let buffer = new Buffer(base64, 'base64');
        // let text = buffer.toString();

        return atob(base64);
    }
}
