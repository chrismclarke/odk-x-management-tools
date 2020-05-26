import { Component, Input, Inject } from '@angular/core';
import { ITableMeta } from '../types/odk.types';
import { OdkRestService } from '../services/odkrest.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { ExportService } from '../services/export.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'odkxm-table-actions',
  template: `
    <button
      *ngIf="!isProduction"
      mat-raised-button
      (click)="backupTable()"
      [disabled]="disabled"
    >
      Backup Table
    </button>
    <button mat-raised-button (click)="exportCSV()" [disabled]="disabled">
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
  isProduction = environment.production;
  disabled = false;
  constructor(
    private odkRest: OdkRestService,
    public dialog: MatDialog,
    public exportService: ExportService
  ) {}

  async backupTable() {
    this.disabled = true;
    const dialogRef = this.dialog.open(TableActionsBackupDialogComponent, {
      width: '250px',
      data: `${this.table.tableId}_${this._generateSuffix()}`
    });

    dialogRef.afterClosed().subscribe(async backupTableId => {
      if (backupTableId) {
        try {
          await this.odkRest.backupCurrentTable(backupTableId);
          console.log('backup complete');
        } catch (error) {
          console.error('backup error', error);
        }
      }
      this.disabled = false;
    });
  }
  async promptDelete() {
    this.disabled = true;
    const dialogRef = this.dialog.open(TableActionsDeleteDialogComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(async shouldDelete => {
      if (shouldDelete) {
        await this.odkRest.deleteCurrentTable();
      }
      this.disabled = false;
    });
  }
  async exportCSV() {
    this.disabled = true;
    console.log('exporting csv');
    const rows = this.odkRest.tableRows$.value;
    const { tableId } = this.odkRest.table$.value;
    const suffix = new Date().toISOString().substring(0, 10);
    const filename = `${tableId}_${suffix}.csv`;
    this.exportService.exportToCSV(rows, filename);
    this.disabled = false;
  }

  /**
   * Create suffix in format yyyy-mm-dd (according to locale time)
   */
  private _generateSuffix() {
    return new Date()
      .toLocaleDateString()
      .split('/')
      .reverse()
      .join('-');
  }
}

@Component({
  selector: 'odkxm-table-actions-delete-dialog',
  template: `
    <h2 mat-dialog-title>Delete Table?</h2>
    <mat-dialog-content
      >This action will permanently delete the table and cannot be
      undone.</mat-dialog-content
    >
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `
})
export class TableActionsDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TableActionsDeleteDialogComponent>
  ) {}
}

@Component({
  selector: 'odkxm-table-actions-backup-dialog',
  template: `
    <h2 mat-dialog-title>Backup Table</h2>
    <mat-form-field>
      <mat-label>Backup Table ID</mat-label>
      <input matInput [(ngModel)]="backupTableId" />
    </mat-form-field>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button [mat-dialog-close]="backupTableId">Backup</button>
    </mat-dialog-actions>
  `
})
export class TableActionsBackupDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TableActionsBackupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public backupTableId: string
  ) {}
}
