import { Response }  from '@angular/http';
import { IErrorsModel } from 'slamby-sdk-angular2';

export module ErrorsModelHelper {
    export function getFromResponse(response: Response): IErrorsModel {
        let model: any = {};
        try {
            model = JSON.parse((<any> response)._body);
        } catch (error) {
            return { Errors: ['Invalid JSON response!'] };
        }

        if ((<IErrorsModel>model).Errors) {
            return <IErrorsModel>model;
        }

        return { Errors: [] };
    }

    export function getFirstError(model: IErrorsModel): string {
        if (!model || model.Errors.length === 0) {
            return '';
        }

        return model.Errors.slice(0, 1)[0];
    }

    export function concatErrors(model: IErrorsModel): string {
        if (!model || model.Errors.length === 0) {
            return '';
        }

        return model.Errors.join(', ');
    }
}
