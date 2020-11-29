import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialComponentsModule } from '../material-components.module';
import { TableRowEditorDialogComponent } from './table-row-editor';
import { ODKXPromptsModule } from './prompts/prompts.module';
import { InputAttributesDisplay } from './components/input-attributes-display';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ODKXPromptsModule,
    MaterialComponentsModule,
  ],
  exports: [],
  declarations: [TableRowEditorDialogComponent, InputAttributesDisplay],
  providers: [],
})
export class TableRowEditorModule {}
