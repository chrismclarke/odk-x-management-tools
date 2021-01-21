import { NgModule } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { SharedComponentsModule } from '../../components/components.module';
import { TableRowEditorModule } from './components/table-row-editor/table-row-editor.module';
import { TableDataComponent } from './components/table-data';
import { TablesComponent } from './tables.component';
import { CommonModule } from '@angular/common';
import { MaterialComponentsModule } from '../../components/material-components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../pipes';

const TablesComponents = [TableDataComponent];
const TablesPages = [TablesComponent];

@NgModule({
  imports: [
    TableRowEditorModule,
    CommonModule,
    MaterialComponentsModule,
    SharedComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule,
    AgGridModule.withComponents([]),
  ],
  exports: [],
  declarations: [...TablesComponents, ...TablesPages],
  providers: [],
})
export class AppTablesModule {}
