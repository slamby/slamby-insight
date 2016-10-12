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
        var escaped = jsonString.replace(/[\n]/g, ' ').replace(/[\r]/g, '');
        return escaped;
    }
}
