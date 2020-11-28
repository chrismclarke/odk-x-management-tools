import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';

// Material Components
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Custom Components
import { ServerLoginComponent } from './server-login';
import { AppTableSelectComponent } from './app-table-select';
import { TableDataComponent } from './table-data';
import {
  TableActionsComponent,
  TableActionsDeleteDialogComponent,
  TableActionsBackupDialogComponent,
} from './table-actions';
import { TableRowEditorDialogComponent } from './table-row-editor/table-row-editor';
import { InputAttributesDisplay } from './table-row-editor/input-attributes-display';
import { ODKXPromptsModule } from './table-row-editor/prompts/prompts.module';

const MAT_COMPONENTS = [
  MatButtonModule,
  MatCheckboxModule,
  MatDialogModule,
  MatInputModule,
  MatPaginatorModule,
  MatSelectModule,
  MatTableModule,
  MatSnackBarModule,
  MatSidenavModule,
  MatListModule,
  MatIconModule,
  MatDividerModule,
  MatCardModule,
  MatTooltipModule,
  MatProgressSpinnerModule,
];

const CUSTOM_COMPONENTS = [
  ServerLoginComponent,
  AppTableSelectComponent,
  TableDataComponent,
  TableActionsComponent,
  TableActionsDeleteDialogComponent,
  TableActionsBackupDialogComponent,
  TableRowEditorDialogComponent,
  InputAttributesDisplay,
];

@NgModule({
  entryComponents: [
    TableActionsDeleteDialogComponent,
    TableActionsBackupDialogComponent,
    TableRowEditorDialogComponent,
    TableRowEditorDialogComponent,
  ],
  imports: [
    ...MAT_COMPONENTS,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AgGridModule.withComponents([]),
    ODKXPromptsModule,
  ],
  exports: [...MAT_COMPONENTS, ...CUSTOM_COMPONENTS],
  declarations: [CUSTOM_COMPONENTS],
  providers: [],
})
export class ComponentsModule {}
