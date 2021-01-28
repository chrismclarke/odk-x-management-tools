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
  selector: 'cwbc-custom-number-na',
  template: `
    <div class="input-container">
      <input
        type="number"
        [odkxmInputAttributes]="odkxColumns.inputAttributes"
        [(ngModel)]="value"
      />
      <button (click)="handleNA()">Not Available</button>
    </div>
  `,
  styleUrls: ['../prompts.scss'],
  styles: [],
  // necessary form value bindings
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomNumberNA),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomNumberNA extends ODKXPromptBase {
  @ViewChild('promptInput') promptInput: ElementRef<HTMLInputElement>;

  parseValue = (v: any) => Number(v);

  /** Set 'Not Available' value of -98 */
  handleNA() {
    this.value = -98;
  }
}
