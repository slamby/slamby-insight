import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { COMPILER_PROVIDERS } from '@angular/compiler';

import { FormsModule } from '@angular/forms';

import { SettingsComponent } from './settings/settings.component';
import { SettingsDialogComponent } from './settings/settings.dialog.component';

import { ImportModule } from './import/import.module';
import { DatasetsModule } from './datasets/datasets.module';
import { DocumentsModule } from './documents/documents.module';
import { ServicesModule } from './services/services.module';
import { ResourcesModule } from './resources/resources.module';
import { ProcessesModule } from './processes/processes.module';
import { WelcomeModule } from './home/welcome.module';
import { NotificationsModule } from './notifications/notifications.module';

import { COMPONENTS_DECLARATIONS } from './common/components/components.module';
import { SERVICE_PROVIDERS } from './common/services/services.module';
import { APPERROR_HANDLER_PROVIDERS } from './common/services/apperror.handler';

import { LogonModule } from './logon/logon.module';

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
        COMPONENTS_DECLARATIONS,

        SafeJsonPipe,
        PrettyJsonPipe,
        PrettyJsonComponent
    ],
    imports: [
        WelcomeModule,
        DatasetsModule,
        DocumentsModule,
        ServicesModule,
        ImportModule,
        ProcessesModule,
        ResourcesModule,
        NotificationsModule,
        CommonComponentsModule,
        LogonModule,

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
