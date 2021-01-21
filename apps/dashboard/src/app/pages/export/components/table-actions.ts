import { Component, Input, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { ExportService } from '../../../services/export.service';
import { OdkService } from '../../../services/odk';
import { ITableMeta } from '../../../types/odk.types';
import { dateSuffix } from '../../../utils/date-utils';

@Component({
  selector: 'odkxm-table-actions',
  template: `
    <button *ngIf="!isProduction" mat-raised-button (click)="backupTable()" [disabled]="disabled">
      Backup Table (non-production)
    </button>
    <button mat-raised-button (click)="exportCSV()" [disabled]="disabled">Export Table</button>
    <button mat-raised-button (click)="exportAllCSV()" [disabled]="disabled">
      Export All Tables
    </button>
    <button
      mat-button
      color="warn"
      (click)="promptDelete()"
      style="margin-left:auto"
      [disabled]="disabled"
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
    `,
  ],
})
export class TableActionsComponent {
  @Input() table: ITableMeta;
  isProduction = environment.production;
  disabled = false;
  constructor(
    private odkService: OdkService,
    public dialog: MatDialog,
    public exportService: ExportService
  ) {}

  async backupTable() {
    this.disabled = true;
    const dialogRef = this.dialog.open(TableActionsBackupDialogComponent, {
      width: '250px',
      data: `${this.table.tableId}_${dateSuffix()}`,
    });

    dialogRef.afterClosed().subscribe(async (backupTableId) => {
      if (backupTableId) {
        try {
          await this.odkService.backupCurrentTable(backupTableId);
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
      width: '250px',
    });

    dialogRef.afterClosed().subscribe(async (shouldDelete) => {
      if (shouldDelete) {
        await this.odkService.deleteCurrentTable();
      }
      this.disabled = false;
    });
  }
  async exportCSV() {
    this.disabled = true;
    console.log('exporting csv');
    const csvRows = this.odkService.tableRows$.value;
    const { tableId } = this.odkService.table$.value;
    const filename = `${tableId}_${dateSuffix()}.csv`;
    this.exportService.exportToCSV({ csvRows, filename });
    this.disabled = false;
  }
  async exportAllCSV() {
    this.disabled = true;
    const exportData = await this.odkService.getAllTableRows();
    const exports = exportData.map((d) => ({
      csvRows: d.rows,
      filename: `${d.tableId}.csv`,
    }));
    await this.exportService.exportToCSVZip(exports, `export_${dateSuffix()}.zip`);
    this.disabled = false;
  }
}

@Component({
  selector: 'odkxm-table-actions-delete-dialog',
  template: `
    <h2 mat-dialog-title>Delete Table?</h2>
    <mat-dialog-content
      >This action will permanently delete the table and cannot be undone.</mat-dialog-content
    >
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
})
export class TableActionsDeleteDialogComponent {
  constructor(public dialogRef: MatDialogRef<TableActionsDeleteDialogComponent>) {}
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
  `,
})
export class TableActionsBackupDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TableActionsBackupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public backupTableId: string
  ) {}
}
