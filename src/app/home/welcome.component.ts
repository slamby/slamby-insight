import { Component, OnInit } from '@angular/core';
import { IpcHelper } from '../common/helpers/ipc.helper';

@Component({
    template: require('./welcome.component.html')
})
export class WelcomeComponent implements OnInit {
    static pageTitle: string = 'Welcome';
    static pageIcon: string = 'fa-home';
    versions: any;

    ngOnInit() {
        this.versions = IpcHelper.getVersions();
    }
}
