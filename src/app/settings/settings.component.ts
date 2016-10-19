import { Component } from '@angular/core';

import { ITab } from '../models/itab';
import { EndpointComponent } from './settings-menu-items/endpoint/endpoint.component';

@Component({
    selector: 'sl-settings',
    template: require('./settings.component.html')
})
export class SettingsComponent {
    settingsMenuItems: Array<ITab> = [
        {
            title: EndpointComponent.pageTitle,
            type: EndpointComponent,
            active: true,
            parameter: null,
            icon: EndpointComponent.pageIcon
        }
    ];
    defaultTab = EndpointComponent;
}
