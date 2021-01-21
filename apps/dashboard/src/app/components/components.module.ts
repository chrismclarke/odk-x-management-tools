import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialComponentsModule } from './material-components.module';

// Custom Components
import { ServerLoginComponent } from './server-login';
import { AppTableSelectComponent } from './app-table-select';
import { SharedPipesModule } from '../pipes';

const CUSTOM_COMPONENTS = [ServerLoginComponent, AppTableSelectComponent];

@NgModule({
  imports: [
    MaterialComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,

    SharedPipesModule,
  ],
  exports: [...CUSTOM_COMPONENTS],
  declarations: [CUSTOM_COMPONENTS],
  providers: [],
})
export class SharedComponentsModule {}
