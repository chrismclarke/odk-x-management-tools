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
import { SharedDirectivesModule } from './directives';

const Pages = [P.ConnectionComponent, P.UsersComponent];

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
    SharedDirectivesModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
