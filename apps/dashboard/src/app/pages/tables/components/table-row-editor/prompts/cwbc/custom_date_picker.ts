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
  selector: 'cwbc-custom-date-picker',
  template: ` <div style="display:flex">
    <div class="input-container">
      <input [odkxmInputAttributes]="odkxColumns.inputAttributes" type="date" [(ngModel)]="value" />
      <button (click)="setToday()">Today</button>
    </div>
  </div>`,
  styleUrls: ['../prompts.scss'],
  styles: [],
  // necessary form value bindings
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatePicker),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomDatePicker extends ODKXPromptBase {
  @ViewChild('promptInput') promptInput: ElementRef<HTMLInputElement>;

  setToday() {
    const today = formatDateForInput();
    this.value = today;
  }
}
function formatDateForInput(d = new Date()) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  function pad(n) {
    return n < 10 ? '0' + n : n;
  }
}
