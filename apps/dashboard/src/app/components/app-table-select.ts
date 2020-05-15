import { Component } from '@angular/core';
import { OdkRestService } from '../services/odkrest.service';
import { ITableMeta } from '../types/odk.types';

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
          ngModel
          [compareWith]="compareById"
          matNativeControl
          (change)="odkRest.setActiveTable(f.value.table)"
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
export class AppTableSelectComponent {
  constructor(public odkRest: OdkRestService) {}

  compareById(c1: ITableMeta, c2: ITableMeta): boolean {
    return c1 && c2 ? c1.tableId === c2.tableId : c1 === c2;
  }
}
