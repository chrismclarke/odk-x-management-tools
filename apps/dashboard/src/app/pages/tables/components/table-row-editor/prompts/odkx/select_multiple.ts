import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ISurveyRowWithValue } from '../../../../../../types/odk.types';
import { ODKXPromptBase } from '../base';

@Component({
  selector: 'odkxm-prompt-select-multiple',
  template: ` <div class="input-container">
    <div style="flex:1">
      <div
        *ngFor="let option of selectOptions"
        style="display:flex; justify-content:center"
        (click)="toggleOption(option.value)"
      >
        <input [checked]="selected[option.value]" type="checkbox" style="width: auto;" />
        <label style="flex:1">{{ option.label }}</label>
      </div>
    </div>
  </div>`,
  styleUrls: ['../prompts.scss'],
  // necessary form value bindings
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectMultiple),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMultiple extends ODKXPromptBase implements OnInit {
  selectOptions: ISurveyRowWithValue['select_options'];
  selected = {};
  @ViewChild('inputEl') inputEl: ElementRef<HTMLInputElement>;

  ngOnInit() {
    this.selectOptions = this.odkxColumns.select_options || [];
  }
  parseValue = (v: any) => {
    this.setSelectedValues(v);
    return v;
  };
  /**
   * Values are saved as strings representing arrays, e.g. '["value1","value2"]'
   * Keep format for ODK but convert locally for checkbox tracking
   */
  setSelectedValues(value: string = '[]') {
    const values: string[] = JSON.parse(value);
    const selected = {};
    values.forEach((v) => (selected[v] = true));
    this.selected = selected;
  }
  toggleOption(value: string) {
    if (this.selected[value]) {
      delete this.selected[value];
    } else {
      this.selected[value] = true;
    }
    // populate value bas as string, e.g. '["value1","value2"]'
    this.value = JSON.stringify(Object.keys(this.selected));
  }
}
