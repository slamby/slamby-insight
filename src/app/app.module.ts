import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { COMPILER_PROVIDERS } from '@angular/compiler';

import { FormsModule } from '@angular/forms';

import { SettingsComponent } from './settings/settings.component';
import { SettingsDialogComponent } from './settings/settings.dialog.component';

import { DatasetSelectorDialogComponent } from './datasets/dataset-selector.dialog.component';
import { TagSelectorDialogComponent } from './documents/tag-selector.dialog.component';

import { ImportComponent } from './import/import.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { ResourcesComponent } from './resources/resources.component';
import { ServicesComponent } from './services/services.component';
import { ProcessesComponent } from './processes/processes.component';
import { WelcomeComponent } from './home/welcome.component';
import { DocumentsComponent } from './documents/documents.component';
import { EndpointComponent } from './settings/settings-menu-items/endpoint/endpoint.component';
import { EndpointDialogComponent } from './settings/settings-menu-items/endpoint/endpoint.dialog.component';
import { NotificationIconComponent } from './notifications/notificationicon.component';
import { NotificationComponent } from './notifications/notification.component';

import { COMPONENTS_DECLARATIONS } from './common/components/components.module';
import { DIRECTIVES_DECLARATIONS } from './common/directives/directives.module';
import { PIPES_DECLARATIONS } from './common/pipes/pipes.module';
import { SERVICE_PROVIDERS } from './common/services/services.module';
import { APPERROR_HANDLER_PROVIDERS } from './common/services/apperror.handler';

import { DocumentDetailsDialogComponent } from './documents/document-details.dialog.component';
import { DocumentDetailsComponent } from './documents/document-details.component';
import { LogonComponent } from './logon/logon.component';


import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { MaterialModule } from '@angular/material';

import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { ToastyModule } from 'ng2-toasty';
import { SafeJsonPipe, PrettyJsonPipe, PrettyJsonComponent } from 'angular2-prettyjson';

@NgModule({
    declarations: [
        // Components
        AppComponent,

        WelcomeComponent,
        SettingsComponent,
        SettingsDialogComponent,
        ImportComponent,
        DatasetsComponent,
        ResourcesComponent,
        DocumentsComponent,

        EndpointComponent,
        EndpointDialogComponent,
        DatasetSelectorDialogComponent,
        TagSelectorDialogComponent,
        NotificationIconComponent,
        NotificationComponent,
        DocumentDetailsDialogComponent,
        LogonComponent,
        DocumentDetailsComponent,
        ServicesComponent,
        ProcessesComponent,
        COMPONENTS_DECLARATIONS,
        DIRECTIVES_DECLARATIONS,
        PIPES_DECLARATIONS,

        SafeJsonPipe,
        PrettyJsonPipe,
        PrettyJsonComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        NgbModule,
        InfiniteScrollModule,
        ToastModule,
        MaterialModule.forRoot(),
        SlimLoadingBarModule.forRoot(),
        ToastyModule.forRoot()
    ],
    exports: [BrowserModule, SlimLoadingBarModule, ToastModule],
    providers: [
        SERVICE_PROVIDERS,
        COMPILER_PROVIDERS,
        APPERROR_HANDLER_PROVIDERS
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
