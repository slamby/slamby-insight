import { ErrorHandler, Injectable, Inject } from '@angular/core';
import { NotificationService } from './notification.service';

export interface AppErrorHandlerOptions {
    rethrowError: boolean;
    unwrapError: boolean;
}

export let APPERROR_HANDLER_OPTIONS: AppErrorHandlerOptions = {
    rethrowError: false,
    unwrapError: true
};

@Injectable()
export class AppErrorHandler implements ErrorHandler {
    constructor( @Inject(APPERROR_HANDLER_OPTIONS) private options: AppErrorHandlerOptions,
        private notificationService: NotificationService) {
    }

    handleError(error: any): void {

        try {
            console.group('ErrorHandler');
            console.error(error.message);
            console.error(error.stack);
            console.groupEnd();
        } catch (handlingError) {
            console.group('ErrorHandler');
            console.warn('Error when trying to output error.');
            console.error(handlingError);
            console.groupEnd();
        }

        try {
            let errorToSend = this.options.unwrapError
                ? this.findOriginalError(error)
                : error;

            this.notificationService.error(error.message, 'Internal Error');

            // TODO: send to main thread via Ipc
            console.error(errorToSend);
        } catch (loggingError) {
            console.group('ErrorHandler');
            console.warn('Error when trying to log error to');
            console.error(loggingError);
            console.groupEnd();
        }

        if (this.options.rethrowError) {
            throw (error);
        }
    }

    private findOriginalError(error: any): any {
        while (error && error.originalError) {
            error = error.originalError;
        }

        return error;
    }
}

export var APPERROR_HANDLER_PROVIDERS = [
    {
        provide: APPERROR_HANDLER_OPTIONS,
        useValue: APPERROR_HANDLER_OPTIONS
    },
    {
        provide: ErrorHandler,
        useClass: AppErrorHandler
    }
];
