import { ElementRef, Input } from '@angular/core';

import { Directive } from '@angular/core';

/**
 * take an object representing input attributes (e.g. {min:5,max:10}) and apply directly to the
 * input element
 */
@Directive({ selector: '[odkxmInputAttributes]' })
export class InputAttributesDirective {
  @Input() set odkxmInputAttributes(inputAttributes: any) {
    if (inputAttributes) {
      this.applyInputAttributes(inputAttributes);
    }
  }
  constructor(private el: ElementRef<HTMLInputElement>) {}

  applyInputAttributes(attributes: { [attribute: string]: any }) {
    Object.entries(attributes).forEach(([name, value]) => {
      this.el.nativeElement.setAttribute(name, JSON.stringify(value));
    });
  }
}
