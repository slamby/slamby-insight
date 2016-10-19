import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { COMPILER_PROVIDERS } from '@angular/compiler';

import { FormsModule } from '@angular/forms';

import { SettingsComponent } from './settings/settings.component';
import { SettingsDialogComponent } from './settings/settings.dialog.component';

import { ImportComponent } from './import/import.component';
import { DatasetsModule } from './datasets/datasets.module';
import { DocumentsModule } from './documents/documents.module';
import { ServicesModule } from './services/services.module';
import { ResourcesComponent } from './resources/resources.component';
import { ProcessesComponent } from './processes/processes.component';
import { WelcomeModule } from './home/welcome.module';
import { EndpointComponent } from './settings/settings-menu-items/endpoint/endpoint.component';
import { EndpointDialogComponent } from './settings/settings-menu-items/endpoint/endpoint.dialog.component';
import { NotificationIconComponent } from './notifications/notificationicon.component';
import { NotificationComponent } from './notifications/notification.component';

import { COMPONENTS_DECLARATIONS } from './common/components/components.module';
import { DIRECTIVES_DECLARATIONS } from './common/directives/directives.module';
import { SERVICE_PROVIDERS } from './common/services/services.module';
import { APPERROR_HANDLER_PROVIDERS } from './common/services/apperror.handler';

import { LogonComponent } from './logon/logon.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastModule } from 'ng2-toastr/ng2-toastr';

import { MaterialModule } from '@angular/material';

import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { ToastyModule } from 'ng2-toasty';
import { SafeJsonPipe, PrettyJsonPipe, PrettyJsonComponent } from 'angular2-prettyjson';
import { CommonComponentsModule } from './common/components/common-components.module';

@NgModule({
    declarations: [
        // Components
        AppComponent,

        SettingsComponent,
        SettingsDialogComponent,
        ImportComponent,
        ResourcesComponent,

        EndpointComponent,
        EndpointDialogComponent,
        NotificationIconComponent,
        NotificationComponent,
        LogonComponent,
        ProcessesComponent,
        COMPONENTS_DECLARATIONS,
        DIRECTIVES_DECLARATIONS,

        SafeJsonPipe,
        PrettyJsonPipe,
        PrettyJsonComponent
    ],
    imports: [
        WelcomeModule,
        DatasetsModule,
        DocumentsModule,
        ServicesModule,
        CommonComponentsModule,
        
        BrowserModule,
        FormsModule,
        HttpModule,
        NgbModule.forRoot(),
        ToastModule,
        MaterialModule.forRoot(),
        SlimLoadingBarModule.forRoot(),
        ToastyModule.forRoot()
    ],
    exports: [BrowserModule, SlimLoadingBarModule, ToastModule],
    providers: [
        SERVICE_PROVIDERS,
        COMPILER_PROVIDERS,
        APPERROR_HANDLER_PROVIDERS,
        DatePipe // for injecting into custom pipe
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
