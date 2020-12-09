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
  selector: 'cwbc-custom-date',
  template: ` <div style="display:flex">
    <div class="input-container">
      <input [odkxmInputAttributes]="odkxColumns.inputAttributes" type="date" [(ngModel)]="value" />
      <button (click)="setDoNotKnow()">Do Not Know</button>
    </div>
  </div>`,
  styleUrls: ['../prompts.scss'],
  styles: [],
  // necessary form value bindings
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDate),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomDate extends ODKXPromptBase {
  @ViewChild('promptInput') promptInput: ElementRef<HTMLInputElement>;

  setDoNotKnow() {
    const defaultDate = '1900-01-01';
    this.value = defaultDate;
  }
}
