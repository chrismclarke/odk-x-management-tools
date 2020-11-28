import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ITableEdit } from '../../components/table-data';
import {
  ITableRowEditorData,
  TableRowEditorDialogComponent,
} from '../../components/table-row-editor/table-row-editor';
import { OdkService } from '../../services/odk';
import { ITableRow } from '../../types/odk.types';

@Component({
  selector: 'odkxm-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
})
export class TablesComponent {
  // Deprecated 2020-11-26
  public pluralMap = {
    '=0': 'No Updates',
    '=1': '1 Update',
    other: '# Updates',
  };
  constructor(public odkService: OdkService, private dialog: MatDialog) {}
  rowUpdates: ITableRow[] = [];
  updatesProcessing = false;

  handleCellSelected(selected: { rowData: ITableRow; colId: string }) {
    // (currently editing individual cells preserves better data type matching)
    console.log('selected row changed', selected);
    const data: ITableRowEditorData = {
      row: selected.rowData,
      colId: selected.colId,
      table: this.odkService.table$.value,
      schema: this.odkService.tableSchema$.value,
    };
    const dialogRef = this.dialog.open(TableRowEditorDialogComponent, {
      height: '90vh',
      width: '90vw',
      data,
    });
    dialogRef.afterClosed().subscribe((data) => {
      console.log('dialog colsed', data);
    });
  }
}
