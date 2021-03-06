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
    IPrcRecommendationByIdRequest, IPrcRecommendationResult, IPrcIndexSettings, IPrcKeywordsRequest, IPrcKeywordsResult, IDataSet, ITag,
    ISearchService, ISearchPrepareSettings, ISearchActivateSettings, ISearchResultWrapper, ISearchRequest, ISearchSettings, IFilter,
    IAutoCompleteSettings, IClassifierSettings, IOrder
} from 'slamby-sdk-angular2';
import { ServicesService } from '../common/services/services.service';
import { ClassifierServicesService } from '../common/services/classifier.services.service';
import { PrcServicesService } from '../common/services/prc.services.service';
import { SearchServicesService } from '../common/services/search.services.service';
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

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NotificationService } from '../common/services/notification.service';
import { ErrorsModelHelper } from '../common/helpers/errorsmodel.helper';
import { Observable } from 'rxjs';

import { ServiceMaintenanceDialogComponent } from './service-maintenance.dialog.component';
import * as _ from 'lodash';

type ServiceType = IService | IPrcService | IClassifierService | ISearchService;

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
        private _tagService: TagService,
        private _searchService: SearchServicesService) {
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
            Header: `${selected.Name} Service Details`,
            OutputObject: detailsObject
        };
        this.resultDialog.model = model;
        this.resultDialog.open();
    }


    modify(selected: ServiceType) {
        let defaultModel = {
            Name: selected.Name,
            Alias: selected.Alias,
            Description: selected.Description,
        };
        let inputModel: CommonInputModel = {
            Header: 'Modify Service',
            Model: defaultModel,
            Type: 'new'
        };

        this.sm.model = inputModel;
        this.sm.open();
        this.sm.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    model.Model.Type = selected.Type;
                    this._servicesService.updateService(selected.Id, <IService>model.Model).subscribe(
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

    deleteConfirm(selected: ServiceType) {
        let model: ConfirmModel = {
            Header: 'Delete Service',
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
            Header: `Add New ${type} Service`,
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
            switch (selected.Type) {
                case IService.ITypeEnum.Classifier:
                    this._classifierService.get(selected.Id).subscribe(
                        (classifierService: IClassifierService) => {
                            let index = this.services.findIndex(s => s.Id === classifierService.Id);
                            this.services[index] = classifierService;
                            this.services = _.sortBy(_.cloneDeep(this.services), 'Alias');
                        },
                        error => this.handleError(error)
                    );
                    break;
                case IService.ITypeEnum.Prc:
                    this._prcService.get(selected.Id).subscribe(
                        (prcService: IPrcService) => {
                            let index = this.services.findIndex(s => s.Id === prcService.Id);
                            this.services[index] = prcService;
                            this.services = _.sortBy(_.cloneDeep(this.services), 'Alias');
                        },
                        error => this.handleError(error)
                    );
                    break;
                case IService.ITypeEnum.Search:
                    this._searchService.get(selected.Id).subscribe(
                        (searchService: ISearchService) => {
                            let index = this.services.findIndex(s => s.Id === searchService.Id);
                            this.services[index] = searchService;
                            this.services = _.sortBy(_.cloneDeep(this.services), 'Alias');
                        },
                        error => this.handleError(error)
                    );
                    break;
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

                    // convert IService to async Observable .get() calls
                    let source = Observable.from(services)
                        .flatMap((s: IService, i: number) => {
                            switch (s.Type) {
                                case IService.ITypeEnum.Classifier:
                                    return <Observable<ServiceType>>this._classifierService.get(s.Id);
                                case IService.ITypeEnum.Prc:
                                    return <Observable<ServiceType>>this._prcService.get(s.Id);
                                case IService.ITypeEnum.Search:
                                    return <Observable<ServiceType>>this._searchService.get(s.Id);
                            }
                        });

                    source.subscribe(
                        (s: ServiceType) => {
                            this.services = this.services = _.sortBy(_.concat(this.services, [s]), 'Alias');
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
                this.inputModel.Model.SelectedTagList = [];
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
        switch (selected.Type) {
            case IService.ITypeEnum.Classifier:
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
                break;
            case IService.ITypeEnum.Prc:
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
                break;
            case IService.ITypeEnum.Search:
                this.sm.dialogClosed.subscribe(
                    (model: CommonInputModel) => {
                        let prepareSettings: ISearchPrepareSettings = {
                            DataSetName: model.Model.SelectedDataset.Name
                        };
                        if (model.Result === DialogResult.Ok) {
                            this._searchService.prepare(selected.Id, prepareSettings).subscribe(
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
                break;
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
            Type: selected.Type,
            ClonableServices: []
        };
        switch (selected.Type) {
            case IService.ITypeEnum.Classifier:
                model.ClonableServices = this.services.filter(s =>
                    s.Type === IService.ITypeEnum.Classifier &&
                    s.Id !== selected.Id &&
                    (<IClassifierService>s).PrepareSettings);
                break;
            case IService.ITypeEnum.Prc:
                model.ClonableServices = this.services.filter(s =>
                    s.Type === IService.ITypeEnum.Prc &&
                    s.Id !== selected.Id &&
                    (<IPrcService>s).PrepareSettings);
                break;
            case IService.ITypeEnum.Search:
                model.ClonableServices = this.services.filter(s =>
                    s.Type === IService.ITypeEnum.Search &&
                    s.Id !== selected.Id &&
                    (<ISearchService>s).PrepareSettings);
                break;
        }
        this.inputModel = {
            Header: selected.Type + ' Prepare Settings',
            Model: model,
            Type: 'prepare'
        };
        this.sm.model = this.inputModel;
        this.sm.open();
    }

    clonePrepareSettings(service: IService) {
        let ds;
        switch (service.Type) {
            case IService.ITypeEnum.Classifier:
                let clService = <IClassifierService>service;
                ds = this.inputModel.Model.Datasets.filter(d => d.Name === clService.PrepareSettings.DataSetName)[0];
                this.prepareDatasetChanged(ds);
                this.inputModel.Model.SelectedDataset = ds;
                this.inputModel.Model.SelectedNGramList = clService.PrepareSettings.NGramList;
                this.inputModel.Model.SelectedTagList = clService.PrepareSettings.TagIdList.slice();
                this.inputModel.Model.CompressLevel = clService.PrepareSettings.CompressLevel;
                if (clService.PrepareSettings.CompressLevel !== 0 &&
                    clService.PrepareSettings.CompressLevel !== 1 &&
                    clService.PrepareSettings.CompressLevel !== 2) {
                    this.inputModel.Model.CompressSettingsJson = JSON.stringify(clService.PrepareSettings.CompressSettings);
                }
                break;
            case IService.ITypeEnum.Prc:
                let prcService = <IPrcService>service;
                ds = this.inputModel.Model.Datasets.filter(d => d.Name === prcService.PrepareSettings.DataSetName)[0];
                this.prepareDatasetChanged(ds);
                this.inputModel.Model.SelectedDataset = ds;
                this.inputModel.Model.SelectedTagList = prcService.PrepareSettings.TagIdList.slice();
                if (prcService.PrepareSettings.CompressLevel !== 0 &&
                    prcService.PrepareSettings.CompressLevel !== 1 &&
                    prcService.PrepareSettings.CompressLevel !== 2) {
                    this.inputModel.Model.CompressSettingsJson = JSON.stringify(prcService.PrepareSettings.CompressSettings);
                }
                break;
            case IService.ITypeEnum.Search:
                let searchService = <ISearchService>service;
                ds = this.inputModel.Model.Datasets.filter(d => d.Name === searchService.PrepareSettings.DataSetName)[0];
                this.prepareDatasetChanged(ds);
                this.inputModel.Model.SelectedDataset = ds;
                break;
        }
    }

    cancelConfirm(selected: ServiceType) {
        let model: ConfirmModel = {
            Header: 'Cancel',
            Message: 'Are you sure to cancel the current process of the ' + selected.Name + ' service',
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

    checkField(e, fields: any, field?: SelectedItem<any>) {
        if (field) {
            fields[fields.indexOf(field)].IsSelected = e.target.checked;
        } else {
            fields.forEach(t => {
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
        switch (selected.Type) {
            case IService.ITypeEnum.Classifier:
                dialogModel = {
                    SelectedNGramList: (<IClassifierService>selected).PrepareSettings.NGramList.slice(),
                    NGramList: (<IClassifierService>selected).PrepareSettings.NGramList.slice(),
                    SelectedTagList: [],
                    TagList: [],
                    SelectedEmphasizedTagList: [],
                    Type: selected.Type,
                    ClonableServices: [],
                    Service: selected
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
                break;
            case IService.ITypeEnum.Prc:
                dialogModel = {
                    Fields: [],
                    Type: selected.Type,
                    ClonableServices: [],
                    Service: selected
                };
                this.sm.dialogClosed.subscribe(
                    (model: CommonInputModel) => {
                        if (model.Result === DialogResult.Ok) {
                            let settingsModel: IPrcActivateSettings = {
                                FieldsForRecommendation: model.Model.Fields.filter(f => f.IsSelected).map(f => f.Item)
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
                        this._datasetService.getDataset((<IPrcService>selected).PrepareSettings.DataSetName).subscribe(
                            (dataset: IDataSet) => {
                                this.inputModel.Model.Fields = dataset.InterpretedFields.map(f => {
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
                break;
        }

        switch (selected.Type) {
            case IService.ITypeEnum.Classifier:
                dialogModel.ClonableServices = this.services.filter(s =>
                    s.Type === IService.ITypeEnum.Classifier &&
                    s.Id !== selected.Id &&
                    (<IClassifierService>s).ActivateSettings);
                break;
            case IService.ITypeEnum.Prc:
                dialogModel.ClonableServices = this.services.filter(s =>
                    s.Type === IService.ITypeEnum.Prc &&
                    s.Id !== selected.Id &&
                    (<IPrcService>s).ActivateSettings);
                break;
        }

        this.inputModel = {
            Header: `${selected.Type} Activate Settings`,
            Model: dialogModel,
            Type: 'activate'
        };


        this.sm.model = this.inputModel;
        this.sm.open();
    }

    cloneActivateSettings(service: IService) {
        this.sm.showProgress = true;
        switch (service.Type) {
            case IService.ITypeEnum.Classifier:
                let clService = <IClassifierService>service;
                let actClService = <IClassifierService>this.inputModel.Model.Service;
                this.inputModel.Model.SelectedNGramList =
                    _.intersection(actClService.PrepareSettings.NGramList, clService.ActivateSettings.NGramList);
                this.inputModel.Model.SelectedTagList =
                    _.intersection(actClService.PrepareSettings.TagIdList, clService.ActivateSettings.TagIdList);
                this.inputModel.Model.SelectedEmphasizedTagList =
                    _.intersection(actClService.PrepareSettings.TagIdList, clService.ActivateSettings.EmphasizedTagIdList);
                break;
            case IService.ITypeEnum.Prc:
                let prcService = <IPrcService>service;
                let actPrcService = <IPrcService>this.inputModel.Model.Service;
                let usableFields = _.intersection(
                    this.inputModel.Model.Fields.map(f => f.Id), prcService.ActivateSettings.FieldsForRecommendation);
                this.inputModel.Model.Fields = this.inputModel.Model.Fields.map(
                    fObj => {
                        return {
                            Id: fObj.Id,
                            Name: fObj.Name,
                            IsSelected: usableFields.indexOf(fObj.Id) > -1,
                            Item: fObj.Item
                        };
                    }
                );
                break;
            case IService.ITypeEnum.Search:
                let searchService = <ISearchService>service;
                let actSearchService = <IPrcService>this.inputModel.Model.Service;

                this.inputModel.Model.AutoCompleteSettings = _.cloneDeep(searchService.ActivateSettings.AutoCompleteSettings);
                this.inputModel.Model.ClassifierSettings = _.cloneDeep(searchService.ActivateSettings.ClassifierSettings);

                this.inputModel.Model.SearchSettings = _.cloneDeep(searchService.ActivateSettings.SearchSettings);

                this.inputModel.Model.ResponseFieldListJson =
                    JSON.stringify(searchService.ActivateSettings.SearchSettings.ResponseFieldList);

                this.inputModel.Model.SearchFieldListJson =
                    JSON.stringify(searchService.ActivateSettings.SearchSettings.SearchFieldList);

                this.inputModel.Model.WeightsJson =
                    searchService.ActivateSettings.SearchSettings.Weights != null ?
                    JSON.stringify(searchService.ActivateSettings.SearchSettings.Weights) :
                    '[]';

                this.inputModel.Model.WeightsJson =
                    searchService.ActivateSettings.SearchSettings.Weights != null ?
                        JSON.stringify(searchService.ActivateSettings.SearchSettings.Weights) :
                        '[]';

                this.inputModel.Model.Query =
                    searchService.ActivateSettings.SearchSettings.Filter != null ?
                        searchService.ActivateSettings.SearchSettings.Filter.Query :
                        '';

                this.inputModel.Model.SelectedTagList =
                    searchService.ActivateSettings.SearchSettings.Filter != null &&
                    searchService.ActivateSettings.SearchSettings.Filter.TagIdList != null ?
                    searchService.ActivateSettings.SearchSettings.Filter.TagIdList :
                        [];

                if (searchService.ActivateSettings.SearchSettings.Order != null) {
                    this.inputModel.Model.Order = _.cloneDeep(searchService.ActivateSettings.SearchSettings.Order);
                }
                break;
        }
        this.sm.showProgress = false;
    }

    search(selected: ServiceType, isActivate: boolean) {
        if (!selected) {
            return;
        }
        let emptyFilter: IFilter = {};
        let emptyOrder: IOrder = {
            OrderByField: '',
            OrderDirection: IOrder.IOrderDirectionEnum.Desc
        };
        let dialogModel = {
            Text: '',
            AutoCompleteSettings: (<ISearchService>selected).ActivateSettings.AutoCompleteSettings != null
                ? _.cloneDeep((<ISearchService>selected).ActivateSettings.AutoCompleteSettings)
                : {},

            ClassifierSettings: (<ISearchService>selected).ActivateSettings.ClassifierSettings != null
                ? _.cloneDeep((<ISearchService>selected).ActivateSettings.ClassifierSettings)
                : {},
            SearchSettings: (<ISearchService>selected).ActivateSettings.SearchSettings != null
                ? _.cloneDeep((<ISearchService>selected).ActivateSettings.SearchSettings)
                : {
                    Filter: emptyFilter
                },
            Type: selected.Type,

            EnabledAutoComplete: false,
            ShownAutoComplete: isActivate || (<ISearchService>selected).ActivateSettings.AutoCompleteSettings != null,
            EnabledClassifier: false,
            ShownClassifier: isActivate || (<ISearchService>selected).ActivateSettings.ClassifierSettings != null,
            EnabledSearch: false,
            ShownSearch: isActivate || (<ISearchService>selected).ActivateSettings.SearchSettings != null,
            ResponseFieldListJson: (<ISearchService>selected).ActivateSettings.SearchSettings != null
                ? JSON.stringify((<ISearchService>selected).ActivateSettings.SearchSettings.ResponseFieldList)
                : '[]',
            SearchFieldListJson: (<ISearchService>selected).ActivateSettings.SearchSettings != null
                ? JSON.stringify((<ISearchService>selected).ActivateSettings.SearchSettings.SearchFieldList)
                : '[]',
            WeightsJson: (<ISearchService>selected).ActivateSettings.SearchSettings != null &&
                (<ISearchService>selected).ActivateSettings.SearchSettings.Weights != null
                ? JSON.stringify((<ISearchService>selected).ActivateSettings.SearchSettings.Weights)
                : '[]',
            Query: (<ISearchService>selected).ActivateSettings.SearchSettings != null &&
                (<ISearchService>selected).ActivateSettings.SearchSettings.Filter != null
                ? (<ISearchService>selected).ActivateSettings.SearchSettings.Filter.Query
                : '',
            TagList: [],
            SelectedTagList: (<ISearchService>selected).ActivateSettings.SearchSettings != null &&
                (<ISearchService>selected).ActivateSettings.SearchSettings.Filter != null &&
                (<ISearchService>selected).ActivateSettings.SearchSettings.Filter.TagIdList != null
                ? (<ISearchService>selected).ActivateSettings.SearchSettings.Filter.TagIdList
                : [],
            Types: Object.keys(ISearchSettings.ITypeEnum),
            Operators: Object.keys(ISearchSettings.IOperatorEnum),
            Orders: Object.keys(IOrder.IOrderDirectionEnum),
            IsActivate: isActivate,
            DefaultFilter: null,
            DefaultWeightsJson: null,
            Order: emptyOrder,
            ClonableServices: [],
            Service: selected
        };
        if (!isActivate) {
            if (dialogModel.Query || dialogModel.SelectedTagList) {
                dialogModel.DefaultFilter = _.cloneDeep(dialogModel.SearchSettings.Filter);
                dialogModel.SearchSettings.Filter = emptyFilter;
                dialogModel.Query = '';
                dialogModel.SelectedTagList = [];

            }
            if (dialogModel.WeightsJson !== '[]') {
                dialogModel.DefaultWeightsJson = dialogModel.WeightsJson;
                dialogModel.WeightsJson = '[]';
            }
        } else {
            dialogModel.ClonableServices = this.services.filter(s =>
                s.Type === IService.ITypeEnum.Search &&
                s.Id !== selected.Id &&
                (<ISearchService>s).ActivateSettings);
        }
        this.sm.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    let filter: IFilter;
                    filter = dialogModel.Query || model.Model.SelectedTagList.length
                        ? {
                            Query: dialogModel.Query,
                            TagIdList: model.Model.SelectedTagList.length ? model.Model.SelectedTagList.slice() : null
                        }
                        : null;
                    let searchSettings: ISearchSettings;
                    searchSettings = {
                        Count: dialogModel.SearchSettings.Count,
                        CutOffFrequency: dialogModel.SearchSettings.CutOffFrequency,
                        Filter: filter,
                        Fuzziness: dialogModel.SearchSettings.Fuzziness,
                        Operator: dialogModel.SearchSettings.Operator,
                        Type: dialogModel.SearchSettings.Type,
                        ResponseFieldList: model.Model.ResponseFieldListJson
                            .replace(' ', '')
                            .replace('\n', '') === '[]' ? null : JSON.parse(model.Model.ResponseFieldListJson),
                        SearchFieldList: model.Model.SearchFieldListJson
                            .replace(' ', '')
                            .replace('\n', '') === '[]' ? null : JSON.parse(model.Model.SearchFieldListJson),
                        Weights: model.Model.WeightsJson
                            .replace(' ', '')
                            .replace('\n', '') === '[]' ? null : JSON.parse(model.Model.WeightsJson),
                        UseDefaultFilter: dialogModel.SearchSettings.UseDefaultFilter,
                        UseDefaultWeights: dialogModel.SearchSettings.UseDefaultWeights,
                        Order: dialogModel.Order.OrderByField.trim() ? dialogModel.Order : null
                    };

                    if (isActivate) {
                        let settingsModel: ISearchActivateSettings = {
                            AutoCompleteSettings: model.Model.AutoCompleteSettings,
                            ClassifierSettings: model.Model.ClassifierSettings.Id ? model.Model.ClassifierSettings : null,
                            SearchSettings: searchSettings
                        };
                        this._searchService.activate(selected.Id, settingsModel).subscribe(
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
                        let requestModel: ISearchRequest = {
                            AutoCompleteSettings: model.Model.ShownAutoComplete ? model.Model.AutoCompleteSettings : null,
                            ClassifierSettings: model.Model.ShownClassifier ? model.Model.ClassifierSettings : null,
                            SearchSettings: model.Model.ShownSearch ? searchSettings : null,
                            Text: model.Model.Text
                        };
                        this._searchService.search(selected.Id, requestModel).subscribe(
                            (results: Array<ISearchResultWrapper>) => {
                                this.dialogService.close();
                                this.resultDialog.model = {
                                    Header: 'Search Result',
                                    OutputObject: {
                                        SearchResult: results
                                    }
                                };
                                // this.sm.unsubscribeAndClose();
                                this.resultDialog.open();
                                this.sm.showProgress = false;
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
                this._tagService.getTags((<ISearchService>selected).PrepareSettings.DataSetName, true).subscribe(
                    (tags: Array<ITag>) => {
                        this.inputModel.Model.TagList = tags;
                        this.sm.showProgress = false;
                    },
                    error => {
                        this.handleError(error);
                        this.sm.showProgress = false;
                    }
                );
            }
        );


        this.inputModel = {
            Header: `${selected.Type} ${isActivate ? 'Activate' : ''} Settings - ${selected.Alias ? selected.Alias : selected.Name}`,
            Model: dialogModel,
            Type: 'search'
        };
        this.sm.model = this.inputModel;
        this.sm.open(false);
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
            Header: `Deactivate ${selected.Type} Service`,
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
        switch (selected.Type) {
            case IService.ITypeEnum.Classifier:
                this._classifierService.deactivate(selected.Id).subscribe(
                    () => {
                        this.refresh(selected);
                    },
                    error => this.handleError(error));
                break;
            case IService.ITypeEnum.Prc:
                this._prcService.deactivate(selected.Id).subscribe(
                    () => {
                        this.refresh(selected);
                    },
                    error => this.handleError(error));
                break;
            case IService.ITypeEnum.Search:
                this._searchService.deactivate(selected.Id).subscribe(
                    () => {
                        this.refresh(selected);
                    },
                    error => this.handleError(error));
                break;
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
            Header: 'Waiting for Recommendation Result'
        };
        let dialogModel;
        if (selected.Type === IService.ITypeEnum.Classifier) {
            dialogModel = {
                Text: '',
                Count: 3,
                NeedTagInResult: true,
                UseEmphasizing: false,
                Type: selected.Type,
                TagList: [],
                SelectedTagList: []
            };
            this.sm.dialogOpened.subscribe(
                () => {
                    this.sm.showProgress = true;
                    this._tagService.getTags((<IClassifierService>selected).PrepareSettings.DataSetName, true).subscribe(
                        (tags: Array<ITag>) => {
                            this.inputModel.Model.TagList = tags;
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
                        let settings: IClassifierRecommendationRequest = {
                            Text: model.Model.Text,
                            Count: model.Model.Count,
                            NeedTagInResult: model.Model.NeedTagInResult,
                            UseEmphasizing: model.Model.UseEmphasizing,
                            ParentTagIdList: model.Model.SelectedTagList == null ? null : model.Model.SelectedTagList.slice()
                        };
                        this._classifierService.recommend(selected.Id, settings).subscribe(
                            (results: Array<IClassifierRecommendationResult>) => {
                                this.dialogService.close();
                                this.resultDialog.model = {
                                    Header: 'Classifier Recommendation Result',
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
            Header: selected.Type + ' Recommendation Request',
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
            Header: 'Waiting for Recommendation Result'
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
            Header: 'Prc Recommendation by Id Request',
            Model: model,
            Type: 'recommendById'
        };
        this.sm.model = this.inputModel;
        this.sm.open();
    }

    keywords(selected: ServiceType) {
        if (!selected || selected.Type === IService.ITypeEnum.Classifier) {
            return;
        }
        this.dialogService.progressModel = {
            Header: 'Waiting for the Keywords Extraction Result'
        };
        this.sm.dialogClosed.subscribe(
            (model: CommonInputModel) => {
                if (model.Result === DialogResult.Ok) {
                    let settings: IPrcKeywordsRequest = {
                        Text: model.Model.Text,
                        TagId: model.Model.TagId
                    };
                    this._prcService.keywords(selected.Id, settings, model.Model.IsStrict).subscribe(
                        (results: Array<IPrcKeywordsResult>) => {
                            this.dialogService.close();
                            this.resultDialog.model = {
                                Header: 'Prc Keywords Extraction Result',
                                OutputObject: {
                                    KeywordsResult: results
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
            Text: '',
            TagId: '',
            Type: selected.Type,
            IsStrict: false
        };
        this.inputModel = {
            Header: 'Prc Keywords Extraction Request',
            Model: model,
            Type: 'keywords'
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
