import { SelectedItem } from './../models/selected-item';
import { TagService } from './../common/services/tag.service';
import { TagListSelectorDialogComponent } from '../common/components/taglist-selector-dialog.component';
import { CommonInputModel } from './../models/common-input.model';
import { DatasetService } from './../common/services/dataset.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Response } from '@angular/http';

import {
    IService, IPrcService, IClassifierService, IClassifierPrepareSettings, IProcess, IPrcPrepareSettings,
    IClassifierActivateSettings, IPrcActivateSettings, IExportDictionariesSettings,
    IClassifierRecommendationRequest, IClassifierRecommendationResult, IPrcRecommendationRequest,
    IPrcRecommendationByIdRequest, IPrcRecommendationResult, IPrcIndexSettings, IDataSet, ITag
} from 'slamby-sdk-angular2';
import { ServicesService } from '../common/services/services.service';
import { ClassifierServicesService } from '../common/services/classifier.services.service';
import { PrcServicesService } from '../common/services/prc.services.service';
import { Messenger } from '../common/services/messenger.service';
import { ProcessesService } from '../common/services/processes.service';
import { CommonInputDialogComponent } from '../common/components/common-input.dialog.component';
import { CommonOutputDialogComponent } from '../common/components/common-output.dialog.component';
import { CommonOutputModel } from '../models/common-output.model';
import { DialogResult } from '../models/dialog-result';
import { ProgressDialogModel } from '../models/progress-dialog-model';
import { DialogComponent } from '../common/components/dialog.component';

import { ConfirmDialogComponent } from '../common/components/confirm.dialog.component';
import { ConfirmModel } from '../models/confirm.model';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';
import { Observable } from 'rxjs';

import { ServiceMaintenanceDialogComponent } from './service-maintenance.dialog.component';
import * as _ from 'lodash';

type ServiceType = IService | IPrcService | IClassifierService;

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
    @ViewChild(ServiceMaintenanceDialogComponent) sm: ServiceMaintenanceDialogComponent;
    @ViewChild(TagListSelectorDialogComponent) tagListSelectorDialog: TagListSelectorDialogComponent;

    serviceType = IService.ITypeEnum;
    serviceStatus = IService.IStatusEnum;

    services: Array<ServiceType> = [];
    inputModel: CommonInputModel;

    constructor(private _servicesService: ServicesService,
        private _classifierService: ClassifierServicesService,
        private _prcService: PrcServicesService,
        private _processesService: ProcessesService,
        private _notificationService: NotificationService,
        private _messenger: Messenger,
        private _datasetService: DatasetService,
        private _tagService: TagService) {
    }

    ngOnInit(): void {
        this.refresh();
    }

    details(selected: ServiceType) {
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


    deleteConfirm(selected: ServiceType) {
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

    delete(selected: ServiceType) {
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
            Model: defaultModel,
            Type: 'new'
        };
        this.sm.model = inputModel;
        this.sm.open();
        this.sm.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    model.Model.Type = type;
                    this._servicesService.createService(<IService>model.Model).subscribe(
                        (service: IService) => {
                            this.services = _.concat(this.services, [service]);
                            this.refresh(service);
                            this.sm.unsubscribeAndClose();
                        },
                        error => {
                            let errors = this.handleError(error);
                            model.ErrorMessage = errors;
                            this.sm.showProgress = false;
                        }
                    );
                }
            }
        );
    }

    refresh(selected?: ServiceType) {
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

                    // let sources = services.map<Observable<ServiceType>>(s => {
                    //     return Observable.create((observer: Observer<ServiceType>) => {
                    //         if (s.Type === IService.ITypeEnum.Classifier) {
                    //             this._classifierService.get(s.Id).subscribe(
                    //                 (classifierService: IClassifierService) => {
                    //                     observer.next(classifierService);
                    //                     observer.complete();
                    //                 },
                    //                 error => observer.error(error)
                    //             );
                    //         } else {
                    //             this._prcService.get(s.Id).subscribe(
                    //                 (prcService: IPrcService) => {
                    //                     observer.next(prcService);
                    //                     observer.complete();
                    //                 },
                    //                 error => observer.error(error)
                    //             );
                    //         }
                    //     });
                    // });
                    // let source = Observable.concat(...sources);

                    // convert IService to async Observable .get() calls
                    let source = Observable.from(services)
                        .flatMap((s: IService, i: number) => {
                            if (s.Type === IService.ITypeEnum.Classifier) {
                                return <Observable<ServiceType>>this._classifierService.get(s.Id);
                            } else {
                                return <Observable<ServiceType>>this._prcService.get(s.Id);
                            }
                        });

                    source.subscribe(
                        (s: ServiceType) => {
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

    prepareDatasetChanged(dataset: any) {
        this.sm.showProgress = true;
        this.inputModel.Model.SelectedNGramList = _.range(1, dataset.NGramCount + 1);
        this.inputModel.Model.NGramList = _.range(1, dataset.NGramCount + 1);
        this.inputModel.Model.SelectedTagList = [];
        this._tagService.getTags(dataset.Name, true).subscribe(
            (tags: Array<ITag>) => {
                this.inputModel.Model.TagList = tags;
                this.inputModel.Model.SelectedTagList = tags.map(t => t.Id);
                this.sm.showProgress = false;
            },
            (error) => {
                this.handleError(error);
                this.sm.showProgress = false;
            }
        );
    }

    prepare(selected: ServiceType) {
        if (!selected) {
            return;
        }

        if (selected.Type === IService.ITypeEnum.Classifier) {
            this.sm.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    if (model.Result === DialogResult.Ok) {
                        let prepareSettings: IClassifierPrepareSettings = {
                            DataSetName: model.Model.SelectedDataset.Name,
                            NGramList: model.Model.SelectedNGramList.slice(),
                            TagIdList: model.Model.SelectedTagList.slice(),
                            CompressLevel: model.Model.CompressLevel,
                            CompressSettings: model.Model.CompressSettingsJson
                                .replace(' ', '')
                                .replace('\n', '') === '{}' ? null : JSON.parse(model.Model.CompressSettingsJson)
                        };
                        this._classifierService.prepare(selected.Id, prepareSettings).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.sm.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.sm.showProgress = false;
                            }
                        );
                    }
                }
            );

        } else {
            this.sm.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    let prepareSettings: IPrcPrepareSettings = {
                        DataSetName: model.Model.SelectedDataset.Name,
                        TagIdList: model.Model.SelectedTagList.slice(),
                        CompressLevel: model.Model.CompressLevel,
                        CompressSettings: model.Model.CompressSettingsJson
                            .replace(' ', '')
                            .replace('\n', '') === '{}' ? null : JSON.parse(model.Model.CompressSettingsJson)
                    };
                    if (model.Result === DialogResult.Ok) {
                        this._prcService.prepare(selected.Id, prepareSettings).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.sm.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.sm.showProgress = false;
                            }
                        );
                    }
                }
            );
        }
        this.sm.dialogOpened.subscribe(
            () => {
                this.sm.showProgress = true;
                this._datasetService.getDatasets().subscribe(
                    (datasets: Array<IDataSet>) => {
                        this.inputModel.Model.Datasets = datasets;
                        this.sm.model = this.inputModel;
                        this.sm.showProgress = false;
                    },
                    error => {
                        this.handleError(error);
                        this.sm.showProgress = false;
                    }
                );
            }
        );
        let model = {
            SelectedDataset: null,
            Datasets: [],
            SelectedNGramList: [],
            NGramList: [],
            SelectedTagList: [],
            TagList: [],
            CompressLevel: 0,
            CompressSettingsJson: '{}',
            Type: selected.Type
        };
        this.inputModel = {
            Header: selected.Type + ' Prepare Settings',
            Model: model,
            Type: 'prepare'
        };
        this.sm.model = this.inputModel;
        this.sm.open();
    }

    cancelConfirm(selected: ServiceType) {
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

    cancel(selected: ServiceType) {
        if (!selected || !selected.ActualProcessId) {
            return;
        }
        this._processesService.cancel(selected.ActualProcessId).subscribe(
            () => this.refresh(selected),
            error => this.handleError(error)
        );
    }

    selectTags(isEmphasize = false) {
        if (!isEmphasize) {
            this.tagListSelectorDialog.tags = this.inputModel.Model.TagList;
            this.tagListSelectorDialog.selectedTagIds = this.inputModel.Model.SelectedTagList.slice();
            this.tagListSelectorDialog.open().result.then((result) => {
                if (result === 'OK') {
                    this.inputModel.Model.SelectedTagList = this.tagListSelectorDialog.selectedTagIds.slice();
                }
            }, (reason) => {
            });
        } else {
            this.tagListSelectorDialog.tags = this.inputModel.Model.TagList;
            this.tagListSelectorDialog.selectedTagIds = this.inputModel.Model.SelectedEmphasizedTagList.slice();
            this.tagListSelectorDialog.open().result.then((result) => {
                if (result === 'OK') {
                    this.inputModel.Model.SelectedEmphasizedTagList = this.tagListSelectorDialog.selectedTagIds.slice();
                }
            }, (reason) => {
            });
        }
    }

    checkField(e, field?: SelectedItem<any>) {
        if (field) {
            this.inputModel.Model.fields[this.inputModel.Model.fields.indexOf(field)].IsSelected = e.target.checked;
        } else {
            this.inputModel.Model.fields.forEach(t => {
                t.IsSelected = e.target.checked;
            });
        }
    }
    getSelectedItemsCount(items: Array<SelectedItem<any>>) {
        let selectedCount = items ? items.filter(t => t.IsSelected).length : 0;
        return selectedCount;
    }

    activate(selected: ServiceType) {
        if (!selected) {
            return;
        }
        let dialogModel;
        if (selected.Type === IService.ITypeEnum.Classifier) {
            dialogModel = {
                SelectedNGramList: (<IClassifierService>selected).PrepareSettings.NGramList.slice(),
                NGramList: (<IClassifierService>selected).PrepareSettings.NGramList.slice(),
                SelectedTagList: [],
                TagList: [],
                SelectedEmphasizedTagList: [],
                Type: selected.Type
            };
            this.sm.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    if (model.Result === DialogResult.Ok) {
                        let settingsModel: IClassifierActivateSettings = {
                            NGramList: model.Model.SelectedNGramList,
                            TagIdList: model.Model.SelectedTagList.slice(),
                            EmphasizedTagIdList: model.Model.SelectedEmphasizedTagList.slice()
                        };
                        this._classifierService.activate(selected.Id, settingsModel).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.sm.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.sm.showProgress = false;
                            }
                        );
                    }
                }
            );
            this.sm.dialogOpened.subscribe(
                () => {
                    this.sm.showProgress = true;
                    this._tagService.getTags((<IClassifierService>selected).PrepareSettings.DataSetName, true).subscribe(
                        (tags: Array<ITag>) => {
                            let tagsForService = (<IClassifierService>selected).PrepareSettings.TagIdList
                                .map(tid => tags.find(t => t.Id === tid))
                                .filter(t => t !== undefined);
                            this.inputModel.Model.TagList = tagsForService;
                            this.inputModel.Model.SelectedTagList = tagsForService.map(t => t.Id);
                            this.inputModel.Model.SelectedEmphasizedTagList = [];
                            this.sm.showProgress = false;
                        },
                        error => {
                            this.handleError(error);
                            this.sm.showProgress = false;
                        }
                    );
                }
            );

        } else {
            dialogModel = {
                fields: [],
                Type: selected.Type
            };
            this.sm.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    if (model.Result === DialogResult.Ok) {
                        let settingsModel: IPrcActivateSettings = {
                            FieldsForRecommendation: model.Model.fields.filter(f => f.IsSelected).map(f => f.Item)
                        };
                        this._prcService.activate(selected.Id, settingsModel).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.sm.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.sm.showProgress = false;
                            }
                        );
                    }
                }
            );
            this.sm.dialogOpened.subscribe(
                () => {
                    this.sm.showProgress = true;
                    this._datasetService.getDataset((<IClassifierService>selected).PrepareSettings.DataSetName).subscribe(
                        (dataset: IDataSet) => {
                            this.inputModel.Model.fields = dataset.InterpretedFields.map(f => {
                                return {
                                    Id: f,
                                    Name: f,
                                    IsSelected: true,
                                    Item: f
                                };
                            });
                            this.sm.showProgress = false;
                        },
                        error => {
                            this.handleError(error);
                            this.sm.showProgress = false;
                        }
                    );
                }
            );
        }
        this.inputModel = {
            Header: selected.Type + ' Activate Settings',
            Model: dialogModel,
            Type: 'activate'
        };
        this.sm.model = this.inputModel;
        this.sm.open();
    }

    export(selected: ServiceType) {
        if (!selected) {
            return;
        }
        this.sm.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    if (selected.Type === IService.ITypeEnum.Classifier) {
                        let settings: IExportDictionariesSettings = {
                            NGramList: model.Model.SelectedNGramList.slice(),
                            TagIdList: model.Model.SelectedTagList.slice(),
                        };
                        this._classifierService.exportDictionary(selected.Id, settings).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.sm.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.sm.showProgress = false;
                            }
                        );
                    } else {
                        let settings: IExportDictionariesSettings = {
                            TagIdList: model.Model.SelectedTagList.slice()
                        };
                        this._prcService.exportDictionary(selected.Id, settings).subscribe(
                            (process: IProcess) => {
                                this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                                this.refresh(selected);
                                this.sm.unsubscribeAndClose();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.sm.showProgress = false;
                            }
                        );
                    }
                }
            }
        );

        this.sm.dialogOpened.subscribe(
            () => {
                this.sm.showProgress = true;
                let dataset = selected.Type === IService.ITypeEnum.Classifier
                    ? (<IClassifierService>selected).PrepareSettings.DataSetName
                    : (<IPrcService>selected).PrepareSettings.DataSetName;
                this._tagService.getTags(dataset, true).subscribe(
                    (tags: Array<ITag>) => {
                        let tagsForService = IService.ITypeEnum.Classifier
                            ? (<IClassifierService>selected).PrepareSettings.TagIdList
                                .map(tid => tags.find(t => t.Id === tid))
                                .filter(t => t !== undefined)
                            : (<IPrcService>selected).PrepareSettings.TagIdList
                                .map(tid => tags.find(t => t.Id === tid))
                                .filter(t => t !== undefined);
                        this.inputModel.Model.TagList = tagsForService;
                        this.inputModel.Model.SelectedTagList = tagsForService.map(t => t.Id);
                        this.inputModel.Model.SelectedEmphasizedTagList = [];
                        this.sm.showProgress = false;
                    },
                    error => {
                        this.handleError(error);
                        this.sm.showProgress = false;
                    }
                );
            }
        );
        let model = {
            SelectedNGramList: selected.Type === IService.ITypeEnum.Classifier
                ? (<IClassifierService>selected).PrepareSettings.NGramList.slice()
                : 0,
            NGramList: selected.Type === IService.ITypeEnum.Classifier
                ? (<IClassifierService>selected).PrepareSettings.NGramList.slice()
                : [],
            SelectedTagList: [],
            TagList: [],
            Type: selected.Type
        };
        this.inputModel = {
            Header: 'Export Dictionary Settings',
            Model: model,
            Type: 'export'
        };
        this.sm.model = this.inputModel;
        this.sm.open();
    }

    deactivateConfirm(selected: ServiceType) {
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

    deactivate(selected: ServiceType) {
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

    changeToggle(property) {
        this.inputModel.Model[property] = !this.inputModel.Model[property];
    }

    recommend(selected: ServiceType) {
        if (!selected) {
            return;
        }
        this.dialogService.progressModel = {
            Header: 'Waiting for recommendation result'
        };
        let dialogModel;
        if (selected.Type === IService.ITypeEnum.Classifier) {
            dialogModel = {
                Text: '',
                Count: 3,
                NeedTagInResult: true,
                UseEmphasizing: false,
                Type: selected.Type
            };
            this.sm.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    if (model.Result === DialogResult.Ok) {
                        let settings: IClassifierRecommendationRequest = {
                            Text: model.Model.Text,
                            Count: model.Model.Count,
                            NeedTagInResult: model.Model.NeedTagInResult,
                            UseEmphasizing: model.Model.UseEmphasizing
                        };
                        this._classifierService.recommend(selected.Id, settings).subscribe(
                            (results: Array<IClassifierRecommendationResult>) => {
                                this.dialogService.close();
                                this.resultDialog.model = {
                                    Header: 'Classifier recommendation result',
                                    OutputObject: {
                                        RecommendationResult: results
                                    }
                                };
                                this.sm.unsubscribeAndClose();
                                this.resultDialog.open();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.sm.showProgress = false;
                            }
                        );
                    }
                }
            );

        } else {
            dialogModel = {
                Text: '',
                Count: 3,
                Query: '',
                TagList: [],
                SelectedTagList: [],
                NeedDocumentInResult: true,
                TagId: '',
                Weightsjson: '[]',
                Type: selected.Type
            };
            this.sm.dialogOpened.subscribe(
                () => {
                    this.sm.showProgress = true;
                    this._tagService.getTags((<IPrcService>selected).PrepareSettings.DataSetName, true).subscribe(
                        (tags: Array<ITag>) => {
                            let tagsForService = (<IPrcService>selected).PrepareSettings.TagIdList
                                .map(tid => tags.find(t => t.Id === tid))
                                .filter(t => t !== undefined);
                            this.inputModel.Model.TagList = tagsForService;
                            this.inputModel.Model.SelectedTagList = [];
                            this.sm.showProgress = false;
                        },
                        error => {
                            this.handleError(error);
                            this.sm.showProgress = false;
                        }
                    );
                }
            );
            this.sm.dialogClosed.subscribe(
                (model: CommonInputModel) => {
                    if (model.Result === DialogResult.Ok) {
                        let settings: IPrcRecommendationRequest = {
                            Text: model.Model.Text,
                            Count: model.Model.Count,
                            Filter: {
                                Query: model.Model.Query,
                                TagIdList: model.Model.SelectedTagList == null ? null : model.Model.SelectedTagList.slice()
                            },
                            NeedDocumentInResult: model.Model.NeedDocumentInResult,
                            TagId: model.Model.TagId,
                            Weights: model.Model.Weightsjson
                                .replace(' ', '')
                                .replace('\n', '') === '[]' ? null : JSON.parse(model.Model.Weightsjson)
                        };
                        this._prcService.recommend(selected.Id, settings).subscribe(
                            (results: Array<IPrcRecommendationResult>) => {
                                this.dialogService.close();
                                this.resultDialog.model = {
                                    Header: 'Prc Recommendation Result',
                                    OutputObject: {
                                        RecommendationResult: results
                                    }
                                };
                                this.sm.unsubscribeAndClose();
                                this.resultDialog.open();
                            },
                            error => {
                                let errors = this.handleError(error);
                                model.ErrorMessage = errors;
                                this.sm.showProgress = false;
                            }
                        );
                    }
                }
            );
        }
        this.inputModel = {
            Header: selected.Type + ' Recommenation Request',
            Model: dialogModel,
            Type: 'recommend'
        };
        this.sm.model = this.inputModel;
        this.sm.open();
    }

    index(selected: ServiceType) {
        if (!selected || selected.Type === IService.ITypeEnum.Classifier) {
            return;
        }
        this.sm.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    let settings: IPrcIndexSettings = {
                        Filter: {
                            Query: model.Model.Query,
                            TagIdList: model.Model.SelectedTagList.slice()
                        }
                    };
                    this._prcService.index(selected.Id, settings).subscribe(
                        (process: IProcess) => {
                            this._messenger.sendMessage({ message: 'newProcessCreated', arg: process });
                            this.refresh(selected);
                            this.sm.unsubscribeAndClose();
                        },
                        error => {
                            let errors = this.handleError(error);
                            model.ErrorMessage = errors;
                            this.sm.showProgress = false;
                        }
                    );
                }
            }
        );
        this.sm.dialogOpened.subscribe(
                () => {
                    this.sm.showProgress = true;
                    this._tagService.getTags((<IPrcService>selected).PrepareSettings.DataSetName, true).subscribe(
                        (tags: Array<ITag>) => {
                            let tagsForService = (<IPrcService>selected).PrepareSettings.TagIdList
                                .map(tid => tags.find(t => t.Id === tid))
                                .filter(t => t !== undefined);
                            this.inputModel.Model.TagList = tagsForService;
                            this.inputModel.Model.SelectedTagList = tagsForService.map(t => t.Id);
                            this.sm.showProgress = false;
                        },
                        error => {
                            this.handleError(error);
                            this.sm.showProgress = false;
                        }
                    );
                }
            );
        let model = {
            Query: '',
            TagList: [],
            SelectedTagList: []
        };
        this.inputModel = {
            Header: 'Prc Index Settings',
            Model: model,
            Type: 'index'
        };
        this.sm.model = this.inputModel;
        this.sm.open();
    }

    partialIndex(selected: ServiceType) {
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

    recommendById(selected: ServiceType) {
        if (!selected || selected.Type === IService.ITypeEnum.Classifier) {
            return;
        }
        this.dialogService.progressModel = {
            Header: 'Waiting for recommendation result'
        };
        this.sm.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    let settings: IPrcRecommendationByIdRequest = {
                        DocumentId: model.Model.DocumentId,
                        Count: model.Model.Count,
                        Query: model.Model.Query,
                        NeedDocumentInResult: model.Model.NeedDocumentInResult,
                        TagId: model.Model.TagId,
                        Weights: model.Model.Weightsjson
                            .replace(' ', '')
                            .replace('\n', '') === '[]' ? null : JSON.parse(model.Model.Weightsjson)
                    };
                    this._prcService.recommendById(selected.Id, settings).subscribe(
                        (results: Array<IPrcRecommendationResult>) => {
                            this.dialogService.close();
                            this.resultDialog.model = {
                                Header: 'Prc recommendation result',
                                OutputObject: {
                                    RecommendationResult: results
                                }
                            };
                            this.sm.unsubscribeAndClose();
                            this.resultDialog.open();
                        },
                        error => {
                            let errors = this.handleError(error);
                            model.ErrorMessage = errors;
                            this.sm.showProgress = false;
                        }
                    );
                }
            }
        );
        let model = {
            DocumentId: '',
            Query: '',
            Count: 3,
            NeedDocumentInResult: true,
            TagId: '',
            Weightsjson: '[]',
            Type: selected.Type
        };
        this.inputModel = {
            Header: 'Prc RecommenationById Request',
            Model: model,
            Type: 'recommendById'
        };
        this.sm.model = this.inputModel;
        this.sm.open();
    }

    handleError(response: Response): string {
        let model = ErrorsModelHelper.getFromResponse(response);
        let errors = ErrorsModelHelper.concatErrors(model);
        this._notificationService.error(`${errors}`, `Service error (${response.status})`);
        return errors;
    }
}
