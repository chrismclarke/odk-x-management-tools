import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  ViewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ODKXPromptBase } from '../base';

@Component({
  selector: 'odkxm-prompt-integer',
  template: ` <div class="input-container">
    <input
      #inputEl
      type="number"
      [disabled]="disabled"
      [(ngModel)]="value"
      step="1"
      [odkxmInputAttributes]="odkxColumns.inputAttributes"
    />
  </div>`,
  styleUrls: ['../prompts.scss'],
  styles: [``],
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
export class Integer extends ODKXPromptBase {
  @ViewChild('inputEl') inputEl: ElementRef<HTMLInputElement>;
  /** Convert to number and round to nearest integer */
  parseValue = (val: string) => {
    const parsed = Math.round(Number(val));
    // when parsing ensure the value is reflected to input element in cases where parsed
    // value does not change, e.g. 8 -> 8.1 (should get rounded back down on the input element)
    if (this.inputEl) {
      this.inputEl.nativeElement.value = parsed as any;
    }
    return parsed;
  };
}
