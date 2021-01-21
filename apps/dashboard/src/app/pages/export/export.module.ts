import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedComponentsModule } from '../../components/components.module';
import {
  TableActionsComponent,
  TableActionsDeleteDialogComponent,
  TableActionsBackupDialogComponent,
} from './components/table-actions';
import { ExportComponent } from './export.component';

import { MaterialComponentsModule } from '../../components/material-components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../pipes';
import { RouterModule, Routes } from '@angular/router';

const Components = [
  TableActionsComponent,
  TableActionsDeleteDialogComponent,
  TableActionsBackupDialogComponent,
];
const Pages = [ExportComponent];

const routes: Routes = [
  {
    path: '',
    component: ExportComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    MaterialComponentsModule,
    SharedComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule,
    RouterModule.forChild(routes),
  ],
  exports: [],
  declarations: [...Components, ...Pages],
  providers: [],
})
export class ExportPageModule {}
