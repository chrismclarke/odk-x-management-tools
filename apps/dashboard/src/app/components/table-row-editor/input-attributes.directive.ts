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
      // this.processValueChanges(inputAttributes)
    }
  }
  constructor(private el: ElementRef<HTMLInputElement>) {}

  applyInputAttributes(attributes: { [attribute: string]: any }) {
    Object.entries(attributes).forEach(([name, value]) => {
      this.el.nativeElement.setAttribute(name, JSON.stringify(value));
    });
    // Set a better default step size (2dp)
    if (!attributes.step) {
      this.el.nativeElement.setAttribute('step', '0.01');
    }
  }

  /** Not implemented, could react to input changes such as rounding step sizes */
  processValueChanges(inputAttributes: any) {
    this.el.nativeElement.onchange = (e) => {
      if (inputAttributes.step) {
        //
      }
    };
  }
}
