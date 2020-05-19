import { Component, OnInit, OnDestroy } from '@angular/core';
import { OdkRestService } from '../services/odkrest.service';
import { ITableMeta } from '../types/odk.types';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'odkxm-app-table-select',
  template: `
    <form *ngIf="(odkRest.allAppIds$ | async).length > 0" #f="ngForm">
      <mat-form-field>
        <mat-label>App ID</mat-label>
        <select
          matNativeControl
          (change)="odkRest.setActiveAppId($event)"
          [value]="odkRest.appId$ | async"
        >
          <option
            *ngFor="let appId of odkRest.allAppIds$ | async"
            [value]="appId"
            >{{ appId }}
          </option>
        </select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Table ID</mat-label>
        <select
          name="table"
          [compareWith]="compareById"
          matNativeControl
          [formControl]="activeTableControl"
          (change)="odkRest.setActiveTable(activeTableControl.value)"
        >
          <option
            *ngFor="let table of odkRest.allTables$ | async"
            [ngValue]="table"
            >{{ table.tableId }}
          </option>
        </select>
      </mat-form-field>
    </form>
  `,
  styles: [
    `
      mat-form-field {
        max-width: 100px;
        width: 100%;
        margin-right: 10px;
      }
    `
  ]
})
export class AppTableSelectComponent implements OnInit, OnDestroy {
  activeTableControl = new FormControl();
  table$: Subscription;

  constructor(public odkRest: OdkRestService) {}

  // Use subscriptions to set form value for table objects
  // (More verbose than simple value async pipe due to need for compareWith fn)
  ngOnInit() {
    this.table$ = this.odkRest.table$.subscribe(t => {
      this.activeTableControl.setValue(t);
    });
  }
  ngOnDestroy() {
    this.table$.unsubscribe();
  }

  compareById(c1: ITableMeta, c2: ITableMeta): boolean {
    return c1 && c2 ? c1.tableId === c2.tableId : c1 === c2;
  }
}
