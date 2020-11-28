import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  ViewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { PromptBase } from './base';

@Component({
  selector: 'odkxm-prompt-integer',
  template: `<input
    #promptInput
    type="number"
    [disabled]="disabled"
    [(ngModel)]="value"
    step="1"
  />`,
  // necessary form value bindings
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Integer),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Integer extends PromptBase {
  @ViewChild('promptInput') promptInput: ElementRef<HTMLInputElement>;

  /** Convert to number and round to nearest integer */
  transformValue(val: any) {
    // null values
    if (val === null) {
      return null;
    } else {
      return Math.round(Number(val));
    }
  }
  /** Update input element value when transformed programtically */
  afterChange(value: any) {
    if (this.promptInput) {
      this.promptInput.nativeElement.value = value;
    }
  }
}

export default Integer;
