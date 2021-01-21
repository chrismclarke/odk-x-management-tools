import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputAttributesDirective } from './directives/input-attributes.directive';
import { ODKXPrompts } from './odkx';
import { CWBCPrompts } from './cwbc';
import { ODKXPromptBase } from './base';

const ODKXDirectives = [InputAttributesDirective];

@NgModule({
  imports: [FormsModule, CommonModule],
  exports: [...ODKXPrompts, ...ODKXDirectives, ...CWBCPrompts, ODKXPromptBase],
  declarations: [...ODKXPrompts, ...ODKXDirectives, ...CWBCPrompts, ODKXPromptBase],
  providers: [],
})
export class ODKXPromptsModule {}
