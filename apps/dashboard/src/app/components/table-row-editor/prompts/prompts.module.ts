import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputAttributesDirective } from './directives/input-attributes.directive';
import * as ODKX from './odkx';
import * as CWBC from './cwbc';
import { ODKXPromptBase } from './base';

const ODKXPrompts = [ODKX.Integer, ODKX.Time, ODKX.SelectMultiple];
const CWBCPrompts = [
  CWBC.CustomDatePicker,
  CWBC.CustomNumber,
  CWBC.CustomDatetimePicker,
  CWBC.CustomSectionComplete,
];
const ODKXDirectives = [InputAttributesDirective];

@NgModule({
  imports: [FormsModule, CommonModule],
  exports: [...ODKXPrompts, ...ODKXDirectives, ...CWBCPrompts, ODKXPromptBase],
  declarations: [...ODKXPrompts, ...ODKXDirectives, ...CWBCPrompts, ODKXPromptBase],
  providers: [],
})
export class ODKXPromptsModule {}
