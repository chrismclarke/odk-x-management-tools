import { Component, OnInit, OnDestroy } from '@angular/core';
import { OdkService } from '../services/odk';
import { ITableMeta } from '../types/odk.types';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'odkxm-app-table-select',
  template: `
    <form *ngIf="(odkService.allAppIds$ | async).length > 0" #f="ngForm" style="display:flex; ">
      <mat-form-field>
        <mat-label>App ID</mat-label>
        <select
          matNativeControl
          (change)="odkService.setActiveAppId($event)"
          [value]="odkService.appId$ | async"
        >
          <option *ngFor="let appId of odkService.allAppIds$ | async" [value]="appId">
            {{ appId }}
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
          (change)="odkService.setActiveTable(activeTableControl.value)"
        >
          <option
            *ngFor="let table of odkService.allTables$ | async | appFieldsDisplay: 'tables'"
            [ngValue]="table"
          >
            {{ table.tableId }}
          </option>
        </select>
      </mat-form-field>
      <div style="position:relative; margin-left:auto">
        <mat-form-field>
          <mat-label>Query Size</mat-label>
          <input
            #fetchLimit
            matNativeControl
            (change)="odkService.setFetchLimit(fetchLimit.value)"
            [value]="odkService.fetchLimit"
            mat-input
            aria-label="Server requests will be split to avoid size or timeout restrictions. Specify maximum rows per request"
          />
        </mat-form-field>
        <button
          mat-icon-button
          matTooltip="Server requests will be split to avoid size or timeout restrictions. Specify maximum rows per request"
          matTooltipClass="tooltip"
          aria-label="Button to show information about Query Size input"
        >
          <mat-icon>info</mat-icon>
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      mat-form-field {
        max-width: 100px;
        width: 100%;
        margin-right: 10px;
      }
    `,
  ],
})
export class AppTableSelectComponent implements OnInit, OnDestroy {
  activeTableControl = new FormControl();
  table$: Subscription;

  constructor(public odkService: OdkService) {}

  // Use subscriptions to set form value for table objects
  // (More verbose than simple value async pipe due to need for compareWith fn)
  ngOnInit() {
    this.table$ = this.odkService.table$.subscribe((t) => {
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
