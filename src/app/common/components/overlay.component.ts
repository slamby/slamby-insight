import { Component, Input } from '@angular/core';

@Component({
    selector: 'sl-overlay',
    template: require('./overlay.component.html'),
    styles: [require('./overlay.component.scss')]
})
export class OverlayComponent {
    @Input() color: string = 'rgba(50,50,50,0.5)';
    @Input() show: boolean = false;
    @Input() icon: boolean = true;
    @Input() iconClass: string = 'fa fa-circle-o-notch fa-spin fa-3x fa-fw';
}
