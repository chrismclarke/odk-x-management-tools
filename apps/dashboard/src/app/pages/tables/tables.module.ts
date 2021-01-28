import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { SharedComponentsModule } from '../../components/components.module';
import { MaterialComponentsModule } from '../../components/material-components.module';
import { SharedPipesModule } from '../../pipes';
import { SharedDirectivesModule } from '../../directives';
import { TableRowEditorModule } from './components/table-row-editor/table-row-editor.module';
import { TableDataComponent } from './components/table-data';
import { TablesComponent } from './tables.component';

const TablesComponents = [TableDataComponent];
const TablesPages = [TablesComponent];

const routes: Routes = [
  {
    path: '',
    component: TablesComponent,
  },
];

@NgModule({
  imports: [
    TableRowEditorModule,
    CommonModule,
    MaterialComponentsModule,
    SharedComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule,
    SharedDirectivesModule,
    AgGridModule.withComponents([]),
    RouterModule.forChild(routes),
  ],
  exports: [],
  declarations: [...TablesComponents, ...TablesPages],
  providers: [],
})
export class TablesPageModule {}
