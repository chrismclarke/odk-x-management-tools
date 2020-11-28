import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromptBase } from './base';
import Integer from './integer';

const ODKXPrompts = [PromptBase, Integer];

@NgModule({
  imports: [FormsModule, CommonModule],
  exports: ODKXPrompts,
  declarations: ODKXPrompts,
  providers: [],
})
export class ODKXPromptsModule {}
