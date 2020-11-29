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
  selector: 'cwbc-custom-datetime-picker',
  template: `
    <div class="input-container">
      <input
        #promptInput
        [odkxmInputAttributes]="odkxColumns.inputAttributes"
        type="datetime-local"
        [value]="setValue(value)"
        (change)="updateValue(promptInput.value)"
        style="flex:1"
        [step]="60"
      />
      <button (click)="setNow()">Now</button>
    </div>
  `,
  styleUrls: ['../prompts.scss'],
  styles: [],
  // necessary form value bindings
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatetimePicker),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Simple datetime picker with a 'now' button
 *
 * NOTE - uses custom set and update methods to handle converting from odk database
 * datetime format to standard html input format
 */
export class CustomDatetimePicker extends ODKXPromptBase {
  @ViewChild('promptInput') promptInput: ElementRef<HTMLInputElement>;

  /** when setting from odk convert to recognised datetime format */
  setValue(v: any) {
    // 2020-02-03 09:55 -> 2020-02-03T09:55
    return v.split(' ').join('T');
  }

  /** when updating form convert back to odk standard format */
  updateValue(v: any) {
    // 2020-02-03T09:55 -> 2020-02-03 09:55
    this.value = v.split('T').join(' ');
  }

  setNow() {
    const now = formatDateTimeForInput();
    this.value = now.split('T').join(' ');
  }
}
function formatDateTimeForInput(d = new Date()) {
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes())
  );
  function pad(n: number) {
    return n < 10 ? '0' + n : n;
  }
}
