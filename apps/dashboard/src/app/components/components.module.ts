import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Material Components
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

// Custom Components
import { ServerLoginComponent } from './server-login';
import { AppTableSelectComponent } from './app-table-select';
import { TableDataComponent } from './table-data';
import { TableActionsComponent } from './table-actions';

const MAT_COMPONENTS = [
  MatButtonModule,
  MatInputModule,
  MatPaginatorModule,
  MatSelectModule,
  MatTableModule
];

const CUSTOM_COMPONENTS = [
  ServerLoginComponent,
  AppTableSelectComponent,
  TableDataComponent,
  TableActionsComponent
];

@NgModule({
  imports: [...MAT_COMPONENTS, FormsModule, ReactiveFormsModule, CommonModule],
  exports: [...MAT_COMPONENTS, ...CUSTOM_COMPONENTS],
  declarations: [CUSTOM_COMPONENTS],
  providers: []
})
export class ComponentsModule {}
