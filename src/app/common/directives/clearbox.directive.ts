import { Directive, ElementRef, HostListener, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
    selector: 'input[clearBox]'
})
export class ClearBoxDirective {
    wrapper: HTMLDivElement;
    icon: HTMLSpanElement;

    @Output() ngModelChange: EventEmitter<any> = new EventEmitter(false);

    constructor(private element: ElementRef,
        private viewContainer: ViewContainerRef, private model: NgModel) {
        let el = this.viewContainer.element.nativeElement;
        let wrapper = document.createElement('div');
        wrapper.style.position = 'relative';

        let icon = document.createElement('span');
        icon.className = 'fa fa-times form-control-feedback';
        icon.style.fontSize = '14px';
        icon.style.color = '#888';
        icon.style.cursor = 'pointer';
        icon.style.pointerEvents = 'auto';
        icon.onclick = () => {
            this.model.valueAccessor.writeValue('');
            this.ngModelChange.emit('');
            element.nativeElement.focus();
        };

        if (!this.model.value) {
            icon.classList.add('hidden');
        }

        this.wrap(el, wrapper);

        el.parentNode.insertBefore(icon, el.nextSibling);

        this.wrapper = wrapper;
        this.icon = icon;
    }

    @HostListener('ngModelChange', ['$event']) onChange(event) {
        if (!event) {
            this.icon.classList.add('hidden');
        } else {
            this.icon.classList.remove('hidden');
        }
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
