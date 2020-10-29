import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ITableRowEditorData,
  TableRowEditorDialogComponent,
} from '../../components/table-row-editor';
import { OdkRestService } from '../../services/odkrest.service';
import { ITableRow } from '../../types/odk.types';

@Component({
  selector: 'odkxm-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
})
export class TablesComponent {
  constructor(public odkRest: OdkRestService, private dialog: MatDialog) {}

  handleSelectedRowChange(rows: ITableRow[]) {
    console.log('selected row changed', rows);
    if (rows[0]) {
      const data: ITableRowEditorData = {
        row: rows[0],
      };
      const dialogRef = this.dialog.open(TableRowEditorDialogComponent, {
        height: '400px',
        width: '600px',
        data,
      });
    }
  }
}
