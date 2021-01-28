import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ODKXPromptBase } from '../base';

@Component({
  selector: 'odkxm-prompt-time',
  template: ` <div class="input-container">
    <input
      type="time"
      [disabled]="disabled"
      [(ngModel)]="value"
      [step]="60"
      [odkxmInputAttributes]="odkxColumns.inputAttributes"
      min="00:00" max="24:00"
    />
  </div>`,
  styleUrls: ['../prompts.scss'],
  styles: [``],
  // necessary form value bindings
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Time),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Time extends ODKXPromptBase {}
