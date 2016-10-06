import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class Messenger {
    // Observable string sources
    private sendMessageSource = new Subject<any>();

    // Observable string streams
    messageAvailable$ = this.sendMessageSource.asObservable();

    // Service message commands
    sendMessage(message: any) {
        setImmediate(() => { this.sendMessageSource.next(message); });
    }
}
