import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[slHorizontalScroll]'
})
export class HorizontalScrollDirective {
    @Input() selector: string = '';

    constructor(private element: ElementRef) {
    }

    @HostListener('wheel', ['$event']) onWheel(event: MouseWheelEvent) {
        this.getElement().scrollLeft += event.deltaY;
    }

    scrollTo(scrollPosition: number) {
        this.getElement().scrollLeft = scrollPosition;
    }

    scrollToEnd() {
        let element = this.getElement();
        element.scrollLeft = element.scrollWidth;
    }

    getElement(): any {
        let element = this.selector
            ? this.element.nativeElement.querySelector(this.selector)
            : this.element.nativeElement;

        if (!element) {
            element = this.element.nativeElement;
        }

        return element;
    }
}
