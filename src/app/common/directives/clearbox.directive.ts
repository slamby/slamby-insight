import { Directive, ElementRef, HostListener, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
    selector: 'input[clearBox]'
})
export class ClearBoxDirective {

    @Output() ngModelChange: EventEmitter<any> = new EventEmitter(false);

    constructor(private element: ElementRef,
        private viewContainer: ViewContainerRef, private model: NgModel) {
        let el = this.viewContainer.element.nativeElement;

        let wrapper = document.createElement('div');
        wrapper.style.position = 'relative';

        let icon = document.createElement('span');
        icon.className = 'fa fa-times-circle-o';
        icon.style.position = 'absolute';
        icon.style.right = '7px';
        icon.style.top = '8px';
        icon.style.bottom = '0';
        icon.style.cursor = 'pointer';
        icon.style.pointerEvents = 'auto';
        icon.onclick = () => {
            this.model.valueAccessor.writeValue('');
            this.ngModelChange.emit('');
        };

        this.wrap(el, wrapper);

        el.parentNode.insertBefore(icon, el.nextSibling);
    }

    @HostListener('ngModelChange', ['$event']) onChange(event) {
        console.log('change');
    }

    wrap(toWrap, wrapper) {
        wrapper = wrapper || document.createElement('div');
        if (toWrap.nextSibling) {
            toWrap.parentNode.insertBefore(wrapper, toWrap.nextSibling);
        } else {
            toWrap.parentNode.appendChild(wrapper);
        }
        return wrapper.appendChild(toWrap);
    }
}
