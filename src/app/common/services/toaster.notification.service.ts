import { Injectable } from '@angular/core';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class ToasterNotificationService {

    constructor(private _toastr: ToastsManager) { }

    error(message: string, title?: string, isPermanent?: boolean) {
        this._toastr.error(message, title, isPermanent ? { dismiss: 'click', showCloseButton: true } : {});
    }

    info(message: string, title?: string, isPermanent?: boolean) {
        this._toastr.info(message, title, isPermanent ? { dismiss: 'click', showCloseButton: true } : {});
    }

    success(message: string, title?: string, isPermanent?: boolean) {
        this._toastr.success(message, title, isPermanent ? { dismiss: 'click', showCloseButton: true } : {});
    }

    warning(message: string, title?: string, isPermanent?: boolean) {
        this._toastr.warning(message, title, isPermanent ? { dismiss: 'click', showCloseButton: true } : {});
    }
}
