import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ODKXPromptBase } from './base';
import { InputAttributesDirective } from './directives/input-attributes.directive';
import { ODKXPromptInteger } from './odkx/integer';
import * as CWBC from './cwbc';

const ODKXPrompts = [ODKXPromptBase, ODKXPromptInteger];
const CWBCPrompts = [CWBC.CustomDatePicker, CWBC.CustomNumber];
const ODKXDirectives = [InputAttributesDirective];

@NgModule({
  imports: [FormsModule, CommonModule],
  exports: [...ODKXPrompts, ...ODKXDirectives, ...CWBCPrompts],
  declarations: [...ODKXPrompts, ...ODKXDirectives, ...CWBCPrompts],
  providers: [],
})
export class ODKXPromptsModule {}
