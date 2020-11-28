import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  ViewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { PromptBase } from '../base';

@Component({
  selector: 'odkxm-prompt-integer',
  template: ` <div style="display:flex">
    <input
      #promptInput
      type="number"
      [disabled]="disabled"
      [(ngModel)]="value"
      step="1"
      [odkxmInputAttributes]="odkxColumns.inputAttributes"
      style="flex:1"
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
class Integer extends PromptBase {
  @ViewChild('promptInput') promptInput: ElementRef<HTMLInputElement>;

  /** Convert to number and round to nearest integer */
  transformValue(val: string) {
    const transformed = Math.round(Number(val));
    if (this.promptInput) {
      // also reflect any transformations back to input element
      this.promptInput.nativeElement.value = transformed as any;
    }
    return transformed;
  }
}

export default Integer;
