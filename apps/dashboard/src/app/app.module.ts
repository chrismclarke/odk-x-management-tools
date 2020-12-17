import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';

import { ConnectionComponent, TablesComponent, ExportComponent } from './pages';
import { MaterialComponentsModule } from './components/material-components.module';

@NgModule({
  declarations: [AppComponent, ConnectionComponent, TablesComponent, ExportComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    AppRoutingModule,
    MaterialComponentsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
