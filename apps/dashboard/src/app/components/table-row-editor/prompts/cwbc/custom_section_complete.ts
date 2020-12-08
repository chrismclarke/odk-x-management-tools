import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ODKXPromptBase } from '../base';

@Component({
  selector: 'cwbc-custom-section-complete',
  template: `
    <div class="input-container">
      <div (click)="toggleCheckbox()">
        <input type="checkbox" [checked]="value === 'true'" style="width: auto;" />
        <label style="flex:1">Mark Section as Complete</label>
      </div>
    </div>
  `,
  styleUrls: ['../prompts.scss'],
  styles: [],
  // necessary form value bindings
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSectionComplete),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomSectionComplete extends ODKXPromptBase {
  /** Simple toggle to reset value to null on deselect, and specify 'true' on select */
  toggleCheckbox() {
    if (this.value === 'true') {
      this.value = null;
    } else {
      this.value = 'true';
    }
  }
}
