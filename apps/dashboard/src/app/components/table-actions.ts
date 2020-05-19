import { Component, Input, Inject } from '@angular/core';
import { ITableMeta } from '../types/odk.types';
import { OdkRestService } from '../services/odkrest.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

@Component({
  selector: 'odkxm-table-actions',
  template: `
    <button mat-raised-button (click)="backupTable()" [disabled]="disabled">
      Backup Table
    </button>
    <button mat-raised-button (click)="backupTable()" [disabled]="disabled">
      Export CSV
    </button>
    <button
      mat-button
      color="warn"
      (click)="promptDelete()"
      style="margin-left:auto"
    >
      Delete Table
    </button>
  `,
  styles: [
    `
      :host {
        display: flex;
      }
      button {
        margin-right: 10px;
      }
    `
  ]
})
export class TableActionsComponent {
  @Input() table: ITableMeta;
  disabled = false;
  constructor(private odkRest: OdkRestService, public dialog: MatDialog) {}

  async backupTable() {
    this.disabled = true;
    try {
      const rows = this.odkRest.tableRows$.value;
      await this.odkRest.backupTable(this.table, rows);
      console.log('backup complete');
    } catch (error) {
      console.error('backup error', error);
    }
    this.disabled = false;
  }
  async promptDelete() {
    const dialogRef = this.dialog.open(TableActionsDialogComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(async shouldDelete => {
      console.log('The dialog was closed', shouldDelete);
      if (shouldDelete) {
        await this.odkRest.deleteCurrentTable();
        console.log('table deleted');
      }
    });
  }
  async exportCSV() {
    console.log('exporting csv');
  }
}

@Component({
  selector: 'odkxm-table-actions-dialog',
  template: `
    <h2 mat-dialog-title>Delete Table?</h2>
    <mat-dialog-content
      >This action will permanently delete the table and cannot be
      undone.</mat-dialog-content
    >
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
      <button mat-button [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `
})
export class TableActionsDialogComponent {
  constructor(public dialogRef: MatDialogRef<TableActionsDialogComponent>) {}
}
