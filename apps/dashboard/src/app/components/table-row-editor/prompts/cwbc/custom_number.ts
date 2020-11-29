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
  selector: 'cwbc-custom-number',
  template: ` <div style="display:flex">
    <div class="input-container">
      <input
        type="number"
        [odkxmInputAttributes]="odkxColumns.inputAttributes"
        [(ngModel)]="value"
      />
      <button
        (click)="handleIDK()"
        *ngIf="odkxColumns.inputAttributes && odkxColumns.inputAttributes.showIDK"
      >
        Don't Know
      </button>
    </div>
  </div>`,
  styleUrls: ['../prompts.scss'],
  styles: [],
  // necessary form value bindings
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomNumber),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomNumber extends ODKXPromptBase {
  @ViewChild('promptInput') promptInput: ElementRef<HTMLInputElement>;

  transformValue(v: any) {
    console.log('transform custom number', v, Number(v));
    return Number(v);
  }
  /** Set 'I don't know' value of -99 */
  handleIDK() {
    this.value = -99;
  }
}
