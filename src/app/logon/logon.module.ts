import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { LogonComponent } from './logon.component';

import { StatusService } from '../common/services/status.service';

import { MaterialModule } from '@angular/material';
import { CommonComponentsModule } from '../common/components/common-components.module';
import { EndpointDialogComponent } from '../settings/settings-menu-items/endpoint/endpoint.dialog.component';
import { EndpointComponent } from '../settings/settings-menu-items/endpoint/endpoint.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomFormsModule } from 'ng2-validation';


@NgModule({
    declarations: [
        LogonComponent,
        EndpointDialogComponent,
        EndpointComponent
    ],
    providers: [
        StatusService
    ],
    exports: [
        LogonComponent
    ],
    imports: [
        CommonComponentsModule,
        MaterialModule.forRoot(),
        NgbModule.forRoot(),
        BrowserModule,
        HttpModule,
        FormsModule,
        CustomFormsModule
    ],
})
export class LogonModule { }
