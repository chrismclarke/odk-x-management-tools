import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ITableEdit } from '../../components/table-data';
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
  public pluralMap = {
    '=0': 'No Updates',
    '=1': '1 Update',
    other: '# Updates',
  };
  constructor(public odkRest: OdkRestService, private dialog: MatDialog) {}
  rowUpdates: ITableRow[] = [];
  updatesProcessing = false;
  handleSelectedRowChange(rows: ITableRow[]) {
    // TODO - implement when more feature-rich editor available for full row
    // (currently editing individual cells preserves better data type matching)
    // console.log('selected row changed', rows);
    // if (rows[0]) {
    //   const data: ITableRowEditorData = {
    //     row: rows[0],
    //   };
    //   const dialogRef = this.dialog.open(TableRowEditorDialogComponent, {
    //     height: '400px',
    //     width: '600px',
    //     data,
    //   });
    // }
  }
  processRowUpdates() {
    this.updatesProcessing = true;
    console.log('processing row updates', this.rowUpdates);
  }

  handleTableEditsChange(changes: ITableEdit[]) {
    console.log('row changes', changes);
    const changesByRowId = {};
    changes.forEach((change) => {
      const { oldValue, newValue, rowData } = change;
      if (oldValue === null && newValue === undefined) {
        return;
      } else {
        changesByRowId[rowData._id] = rowData;
      }
    });
    this.rowUpdates = Object.values(changesByRowId);
  }
}
