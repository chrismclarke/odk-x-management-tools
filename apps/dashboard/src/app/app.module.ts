import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedComponentsModule } from './components/components.module';

import * as P from './pages';
import { MaterialComponentsModule } from './components/material-components.module';
import { AppDirectivesModule } from './directives';
import { AppTablesModule } from './pages/tables/tables.module';

const Pages = [P.ConnectionComponent, P.ExportComponent, P.UsersComponent];

@NgModule({
  declarations: [AppComponent, ...Pages],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    AppRoutingModule,
    MaterialComponentsModule,
    AppDirectivesModule,
    HttpClientModule,
    AppTablesModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
