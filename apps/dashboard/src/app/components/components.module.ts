import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { MaterialComponentsModule } from './material-components.module';

// Custom Components
import { ServerLoginComponent } from './server-login';
import { AppTableSelectComponent } from './app-table-select';
import { TableDataComponent } from './table-data';
import {
  TableActionsComponent,
  TableActionsDeleteDialogComponent,
  TableActionsBackupDialogComponent,
} from './table-actions';
import { TableRowEditorModule } from './table-row-editor/table-row-editor.module';
import { SharedPipesModule } from '../pipes';

const CUSTOM_COMPONENTS = [
  ServerLoginComponent,
  AppTableSelectComponent,
  TableDataComponent,
  TableActionsComponent,
  TableActionsDeleteDialogComponent,
  TableActionsBackupDialogComponent,
];

@NgModule({
  entryComponents: [TableActionsDeleteDialogComponent, TableActionsBackupDialogComponent],
  imports: [
    MaterialComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AgGridModule.withComponents([]),
    TableRowEditorModule,
    SharedPipesModule,
  ],
  exports: [...CUSTOM_COMPONENTS],
  declarations: [CUSTOM_COMPONENTS],
  providers: [],
})
export class ComponentsModule {}
