import { Component, OnInit, ViewChild } from '@angular/core';
import { Response } from '@angular/http';

import {
    IService, IPrcService, IClassifierService, IClassifierPrepareSettings, IProcess, IPrcPrepareSettings,
    IClassifierActivateSettings, IPrcActivateSettings, IExportDictionariesSettings,
    IClassifierRecommendationRequest, IClassifierRecommendationResult, IPrcRecommendationRequest,
    IPrcRecommendationByIdRequest, IPrcRecommendationResult, IPrcIndexSettings
} from 'slamby-sdk-angular2';
import { ServicesService } from '../common/services/services.service';
import { ClassifierServicesService } from '../common/services/classifier.services.service';
import { PrcServicesService } from '../common/services/prc.services.service';
import { Messenger } from '../common/services/messenger.service';
import { ProcessesService } from '../common/services/processes.service';
import { CommonInputDialogComponent } from '../common/components/common-input.dialog.component';
import { CommonOutputDialogComponent } from '../common/components/common-output.dialog.component';
import { CommonInputModel } from '../models/common-input.model';
import { CommonOutputModel } from '../models/common-output.model';
import { DialogResult } from '../models/dialog-result';
import { ProgressDialogModel } from '../models/progress-dialog-model';
import { DialogComponent } from '../common/components/dialog.component';

import { ConfirmDialogComponent } from '../common/components/confirm.dialog.component';
import { ConfirmModel } from '../models/confirm.model';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';
import { Observable, Observer } from 'rxjs';

@Component({
    template: require('./services.component.html'),
    styles: [require('./services.component.scss')]
})
export class ServicesComponent implements OnInit {
    static pageTitle: string = 'Services';
    static pageIcon: string = 'fa-tasks';

    @ViewChild(CommonInputDialogComponent) inputDialog: CommonInputDialogComponent;
    @ViewChild(CommonOutputDialogComponent) resultDialog: CommonOutputDialogComponent;
    @ViewChild(DialogComponent) dialogService: DialogComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog: ConfirmDialogComponent;

    serviceType = IService.ITypeEnum;
    serviceStatus = IService.IStatusEnum;

    services: Array<IService | IPrcService | IClassifierService> = [];

    constructor(private _servicesService: ServicesService,
        private _classifierService: ClassifierServicesService,
        private _prcService: PrcServicesService,
        private _processesService: ProcessesService,
        private _notificationService: NotificationService,
        private _messenger: Messenger) {
    }

    ngOnInit(): void {
        this.refresh();
    }

    details(selected: IService | IPrcService | IClassifierService) {
        let detailsObject = {};
        Object.keys(selected).forEach(prop => {
            detailsObject[prop] = selected[prop];
        });
        let model: CommonOutputModel = {
            Header: `${selected.Name} service details`,
            OutputObject: detailsObject
        };
        this.resultDialog.model = model;
        this.resultDialog.open();
    }

    deleteConfirm(selected: IService | IPrcService | IClassifierService) {
        let model: ConfirmModel = {
            Header: 'Delete service',
            Message: 'Are you sure to remove the following service: ' + selected.Name,
            Buttons: ['yes', 'no']
        };
        this.confirmDialog.model = model;
        this.confirmDialog.dialogClosed.subscribe(
            (result: ConfirmModel) => {
                if (result.Result === DialogResult.Yes) {
                    this.delete(selected);
                }
            },
            error => this.handleError(error)
        );
        this.confirmDialog.open();
    }

    delete(selected: IService | IPrcService | IClassifierService) {
        this._servicesService
            .deleteService(selected.Id)
            .subscribe(
            () => this.services = _.without(this.services, selected),
            error => this.handleError(error));
    }

    add(type: IService.ITypeEnum) {
        let defaultModel = {
            Name: '',
            Alias: '',
            Description: '',
        };
        let inputModel: CommonInputModel = {
            Header: type === IService.ITypeEnum.Classifier ? 'Add New Classifier Service' : 'Add New Prc Service',
            Model: defaultModel
        };
        this.inputDialog.model = inputModel;
        this.inputDialog.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    model.Model.Type = type;
                    this._servicesService.createService(<IService>model.Model).subscribe(
                        (service: IService) => {
                            this.services = _.concat(this.services, [service]);
                            this.refresh(service);
                            this.inputDialog.unsubscribeAndClose();
                        },
                        error => {
                            let errors = this.handleError(error);
                            model.ErrorMessage = errors;
                            this.inputDialog.showProgress = false;
                        }
                    );
                }
            }
        );
        this.inputDialog.open();
    }

    refresh(selected?: IService | IPrcService | IClassifierService) {
        if (selected) {
            if (selected.Type === IService.ITypeEnum.Classifier) {
                this._classifierService.get(selected.Id).subscribe(
                    (classifierService: IClassifierService) => {
                        let index = this.services.findIndex(s => s.Id === classifierService.Id);
                        this.services[index] = classifierService;
                        this.services = _.cloneDeep(this.services);
                    },
                    error => this.handleError(error)
                );
            } else {
                this._prcService.get(selected.Id).subscribe(
                    (prcService: IPrcService) => {
                        let index = this.services.findIndex(s => s.Id === prcService.Id);
                        this.services[index] = prcService;
                        this.services = _.cloneDeep(this.services);
                    },
                    error => this.handleError(error)
                );
            }
        } else {
            this.services = [];
            this._servicesService
                .getServices()
                .subscribe(
                (services: Array<IService>) => {

                    let dialogModel: ProgressDialogModel = {
                        All: services.length,
                        ErrorCount: 0,
                        Done: 0,
                        Percent: 0,
                        IsDone: false,
                        Header: 'Loading...'
                    };
                    this.dialogService.progressModel = dialogModel;
                    this.dialogService.openDialog('progress');
                    let sources = services.map<Observable<IPrcService | IClassifierService | IService>>(s => {
                        return Observable.create((observer: Observer<IPrcService | IClassifierService | IService>) => {
                            if (s.Type === IService.ITypeEnum.Classifier) {
                                this._classifierService.get(s.Id).subscribe(
                                    (classifierService: IClassifierService) => {
                                        observer.next(classifierService);
                                        observer.complete();
                                    },
                                    error => {
                                        observer.error(error);
                                        observer.complete();
                                    }
                                );
                            } else {
                                this._prcService.get(s.Id).subscribe(
                                    (prcService: IPrcService) => {
                                        observer.next(prcService);
                                        observer.complete();
                                    },
                                    error => {
                                        observer.error(error);
                                        observer.complete();
                                    }
                                );
                            }
                        });
                    });
                    let source = Observable.concat(...sources);

                    source.subscribe(
                        (s: IPrcService | IClassifierService | IService) => {
                            this.services = this.services = _.concat(this.services, [s]);
                            dialogModel.Done += 1;
                            dialogModel.Percent = (dialogModel.Done / dialogModel.All) * 100;
                        },
                        error => {
                            this.handleError(error);
                            dialogModel.ErrorCount += 1;
                            dialogModel.Done += 1;
                            dialogModel.Percent = (dialogModel.Done / dialogModel.All) * 100;
                        },
                        () => {
                            dialogModel.IsDone = true;
                            this.dialogService.close();
                        }
                    );
                    dialogModel.IsDone = true;
                },
                error => this.handleError(error));
        }
    }

    prepare(selected: IService | IPrcService | IClassifierService) {
        if (!selected) {
            return;
        }
        if (selected.Type === IService.ITypeEnum.Classifier) {
            let model: IClassifierPrepareSettings = {
                DataSetName: '',
                NGramList: [],
                TagIdList: [],
                CompressLevel: 0,
                CompressSettings: null
            };
            let inputModel: CommonInputModel = {
                Header: 'Classifier Prepare Settings',
                Model: model
            };
            this.inputDialog.model = inputModel;
            this.inputDialog.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    if (model.Result === DialogResult.Ok) {
                        this._classifierService.prepare(selected.Id, model.Model).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.inputDialog.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.inputDialog.showProgress = false;
                            }
                        );
                    }
                }
            );
            this.inputDialog.open();

        } else {
            let model: IPrcPrepareSettings = {
                DataSetName: '',
                TagIdList: [],
                CompressLevel: 0,
                CompressSettings: null
            };
            let inputModel: CommonInputModel = {
                Header: 'Prc Prepare Settings',
                Model: model
            };
            this.inputDialog.model = inputModel;
            this.inputDialog.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    if (model.Result === DialogResult.Ok) {
                        this._prcService.prepare(selected.Id, model.Model).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.inputDialog.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.inputDialog.showProgress = false;
                            }
                        );
                    }
                }
            );
            this.inputDialog.open();
        }
    }

    cancelConfirm(selected: IService | IPrcService | IClassifierService) {
        let model: ConfirmModel = {
            Header: 'Cancel',
            Message: 'Are you sure to cancel the current process of ' + selected.Name + ' service',
            Buttons: ['yes', 'no']
        };
        this.confirmDialog.model = model;
        this.confirmDialog.dialogClosed.subscribe(
            (result: ConfirmModel) => {
                if (result.Result === DialogResult.Yes) {
                    this.cancel(selected);
                }
            },
            error => this.handleError(error)
        );
        this.confirmDialog.open();
    }

    cancel(selected: IService | IPrcService | IClassifierService) {
        if (!selected || !selected.ActualProcessId) {
            return;
        }
        this._processesService.cancel(selected.ActualProcessId).subscribe(
            () => this.refresh(selected),
            error => this.handleError(error)
        );
    }

    activate(selected: IService | IPrcService | IClassifierService) {
        if (!selected) {
            return;
        }
        if (selected.Type === IService.ITypeEnum.Classifier) {
            let model: IClassifierActivateSettings = {
                NGramList: [],
                TagIdList: [],
                EmphasizedTagIdList: []
            };
            let inputModel: CommonInputModel = {
                Header: 'Classifier Activate Settings',
                Model: model
            };
            this.inputDialog.model = inputModel;
            this.inputDialog.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    if (model.Result === DialogResult.Ok) {
                        this._classifierService.activate(selected.Id, model.Model).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.inputDialog.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.inputDialog.showProgress = false;
                            }
                        );
                    }
                }
            );
            this.inputDialog.open();

        } else {
            let model: IPrcActivateSettings = {
                FieldsForRecommendation: []
            };
            let inputModel: CommonInputModel = {
                Header: 'Prc Activate Settings',
                Model: model
            };
            this.inputDialog.model = inputModel;
            this.inputDialog.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    if (model.Result === DialogResult.Ok) {
                        this._prcService.activate(selected.Id, model.Model).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.inputDialog.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.inputDialog.showProgress = false;
                            }
                        );
                    }
                }
            );
            this.inputDialog.open();
        }
    }

    export(selected: IService | IPrcService | IClassifierService) {
        if (!selected) {
            return;
        }

        let settings: IExportDictionariesSettings = {
            NGramList: [],
            TagIdList: []
        };
        let inputModel: CommonInputModel = {
            Header: 'Export Dictionary Settings',
            Model: settings
        };
        this.inputDialog.model = inputModel;
        this.inputDialog.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    if (selected.Type === IService.ITypeEnum.Classifier) {
                        this._classifierService.exportDictionary(selected.Id, model.Model).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.inputDialog.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.inputDialog.showProgress = false;
                            }
                        );
                    } else {
                        this._prcService.exportDictionary(selected.Id, model.Model).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.inputDialog.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.inputDialog.showProgress = false;
                            }
                        );
                    }
                }
            }
        );
        this.inputDialog.open();
    }

    deactivateConfirm(selected: IService | IPrcService | IClassifierService) {
        let model: ConfirmModel = {
            Header: 'Deactivate service',
            Message: 'Are you sure to deactivate the following service: ' + selected.Name,
            Buttons: ['yes', 'no']
        };
        this.confirmDialog.model = model;
        this.confirmDialog.dialogClosed.subscribe(
            (result: ConfirmModel) => {
                if (result.Result === DialogResult.Yes) {
                    this.deactivate(selected);
                }
            },
            error => this.handleError(error)
        );
        this.confirmDialog.open();
    }

    deactivate(selected: IService | IPrcService | IClassifierService) {
        if (!selected) {
            return;
        }
        if (selected.Type === IService.ITypeEnum.Classifier) {
            this._classifierService.deactivate(selected.Id).subscribe(
                () => {
                    this.refresh(selected);
                },
                error => this.handleError(error));
        } else {
            this._prcService.deactivate(selected.Id).subscribe(
                () => {
                    this.refresh(selected);
                },
                error => this.handleError(error));
        }
    }

    recommend(selected: IService | IPrcService | IClassifierService) {
        if (!selected) {
            return;
        }
        this.dialogService.progressModel = {
            Header: 'Waiting for recommendation result'
        };
        if (selected.Type === IService.ITypeEnum.Classifier) {
            let model: IClassifierRecommendationRequest = {
                Text: '',
                Count: 3,
                NeedTagInResult: true,
                UseEmphasizing: false
            };
            let inputModel: CommonInputModel = {
                Header: 'Classifier Recommenation Request',
                Model: model
            };
            this.inputDialog.model = inputModel;
            this.inputDialog.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    if (model.Result === DialogResult.Ok) {
                        this._classifierService.recommend(selected.Id, model.Model).subscribe(
                            (results: Array<IClassifierRecommendationResult>) => {
                                this.dialogService.close();
                                this.resultDialog.model = {
                                    Header: 'Classifier recommendation result',
                                    OutputObject: {
                                        RecommendationResult: results
                                    }
                                };
                                this.inputDialog.unsubscribeAndClose();
                                this.resultDialog.open();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.inputDialog.showProgress = false;
                            }
                        );
                    }
                }
            );
            this.inputDialog.open();

        } else {
            let model: IPrcRecommendationRequest = {
                Text: '',
                Count: 3,
                Filter: '',
                NeedDocumentInResult: false,
                TagId: '',
                Weights: null
            };
            let inputModel: CommonInputModel = {
                Header: 'Prc Recommenation Request',
                Model: model
            };
            this.inputDialog.model = inputModel;
            this.inputDialog.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    if (model.Result === DialogResult.Ok) {
                        this._prcService.recommend(selected.Id, model.Model).subscribe(
                            (results: Array<IPrcRecommendationResult>) => {
                                this.dialogService.close();
                                this.resultDialog.model = {
                                    Header: 'Prc recommendation result',
                                    OutputObject: {
                                        RecommendationResult: results
                                    }
                                };
                                this.inputDialog.unsubscribeAndClose();
                                this.resultDialog.open();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.inputDialog.showProgress = false;
                            }
                        );
                    }
                }
            );
            this.inputDialog.open();
        }
    }

    index(selected: IService | IPrcService | IClassifierService) {
        if (!selected || selected.Type === IService.ITypeEnum.Classifier) {
            return;
        }
        let settings: IPrcIndexSettings = {
            Filter: ''
        };
        let inputModel: CommonInputModel = {
            Header: 'Prc Index Settings',
            Model: settings
        };
        this.inputDialog.model = inputModel;
        this.inputDialog.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    this._prcService.index(selected.Id, model.Model).subscribe(
                        (process: IProcess) => {
                            this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                            this.refresh(selected);
                            this.inputDialog.unsubscribeAndClose();
                        },
                        error => {
                            let errors = this.handleError(error);
                            model.ErrorMessage = errors;
                            this.inputDialog.showProgress = false;
                        }
                    );
                }
            }
        );
        this.inputDialog.open();
    }

    partialIndex(selected: IService | IPrcService | IClassifierService) {
        if (!selected || selected.Type === IService.ITypeEnum.Classifier) {
            return;
        }
        this._prcService.indexPartial(selected.Id).subscribe(
            (process: IProcess) => {
                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                this.refresh(selected);
            },
            error => this.handleError(error)
        );
    }

    recommendById(selected: IService | IPrcService | IClassifierService) {
        if (!selected || selected.Type === IService.ITypeEnum.Classifier) {
            return;
        }
        this.dialogService.progressModel = {
            Header: 'Waiting for recommendation result'
        };
        let request: IPrcRecommendationByIdRequest = {
            DocumentId: '',
            Query: '',
            Count: 3,
            NeedDocumentInResult: false,
            TagId: '',
            Weights: null
        };
        let inputModel: CommonInputModel = {
            Header: 'Prc RecommenationById Request',
            Model: request
        };
        this.inputDialog.model = inputModel;
        this.inputDialog.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    this._prcService.recommendById(selected.Id, model.Model).subscribe(
                        (results: Array<IPrcRecommendationResult>) => {
                            this.dialogService.close();
                            this.resultDialog.model = {
                                Header: 'Prc recommendation result',
                                OutputObject: {
                                    RecommendationResult: results
                                }
                            };
                            this.inputDialog.unsubscribeAndClose();
                            this.resultDialog.open();
                        },
                        error => {
                            let errors = this.handleError(error);
                            model.ErrorMessage = errors;
                            this.inputDialog.showProgress = false;
                        }
                    );
                }
            }
        );
        this.inputDialog.open();
    }

    handleError(response: Response): string {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `DataSet error (${response.status})`);
        return errors;
    }
}
