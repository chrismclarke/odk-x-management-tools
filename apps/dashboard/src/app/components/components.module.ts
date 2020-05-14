import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { ServerLoginComponent } from './server-login';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const MAT_COMPONENTS = [MatInputModule, MatButtonModule, MatSelectModule];

const CUSTOM_COMPONENTS = [ServerLoginComponent];

@NgModule({
  imports: [...MAT_COMPONENTS, FormsModule, ReactiveFormsModule, CommonModule],
  exports: [...MAT_COMPONENTS, ...CUSTOM_COMPONENTS],
  declarations: [CUSTOM_COMPONENTS],
  providers: []
})
export class ComponentsModule {}
