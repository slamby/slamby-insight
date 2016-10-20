import { Component, OnInit } from '@angular/core';
import { IpcHelper } from '../common/helpers/ipc.helper';
const {shell} = require('electron');

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

    openDevSite() {
        shell.openExternal('http://developers.slamby.com');
    }
}
