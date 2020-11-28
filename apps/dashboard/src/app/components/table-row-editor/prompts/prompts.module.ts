import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromptBase } from './base';
import { InputAttributesDirective } from './directives/input-attributes.directive';
import Integer from './odkx/integer';
import CustomDatePicker from './cwbc/custom_date_picker';

const ODKXPrompts = [PromptBase, Integer];
const CWBCPrompts = [CustomDatePicker];
const ODKXDirectives = [InputAttributesDirective];

@NgModule({
  imports: [FormsModule, CommonModule],
  exports: [...ODKXPrompts, ...ODKXDirectives, ...CWBCPrompts],
  declarations: [...ODKXPrompts, ...ODKXDirectives, ...CWBCPrompts],
  providers: [],
})
export class ODKXPromptsModule {}
