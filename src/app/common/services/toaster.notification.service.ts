import { Injectable } from '@angular/core';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class ToasterNotificationService {

    constructor(private _toastr: ToastsManager) { }

    error(message: string, title?: string) {
        this._toastr.error(message, title);
    }

    info(message: string, title?: string) {
        this._toastr.info(message, title);
    }

    success(message: string, title?: string) {
        this._toastr.success(message, title);
    }

    warning(message: string, title?: string) {
        this._toastr.warning(message, title);
    }
}
