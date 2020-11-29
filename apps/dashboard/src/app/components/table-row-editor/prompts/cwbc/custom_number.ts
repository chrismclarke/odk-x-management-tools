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
  template: `
    <div class="input-container">
      <input
        type="number"
        [odkxmInputAttributes]="odkxColumns.inputAttributes"
        [(ngModel)]="value"
        style="flex:1"
      />
      <button
        (click)="handleIDK()"
        *ngIf="odkxColumns.inputAttributes && odkxColumns.inputAttributes.showIDK"
      >
        Don't Know
      </button>
    </div>
  `,
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

  parseValue = (v: any) => Number(v);

  /** Set 'I don't know' value of -99 */
  handleIDK() {
    this.value = -99;
  }
}
