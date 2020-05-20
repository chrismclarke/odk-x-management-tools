import { Component, Input, ViewChild } from '@angular/core';
import { ITableRow } from '../types/odk.types';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { OdkRestService } from '../services/odkrest.service';

@Component({
  selector: 'odkxm-table-data',
  template: `
    <div class="container">
      <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
        <ng-container *ngFor="let col of displayedColumns" [matColumnDef]="col">
          <th mat-header-cell *matHeaderCellDef>{{ col }}</th>
          <td mat-cell *matCellDef="let data">{{ data[col] }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>

      <mat-paginator
        [pageSizeOptions]="[5, 10, 50]"
        showFirstLastButtons
      ></mat-paginator>
    </div>
  `,
  styles: [
    `
      .container {
        width: 100%;
        overflow-x: auto;
      }
      table {
        width: 100%;
      }
      th.mat-header-cell,
      td.mat-cell {
        padding: 5px;
      }
    `
  ]
})
export class TableDataComponent {
  dataSource: MatTableDataSource<ITableRow>;
  displayedColumns: string[] = [];
  showMeta = true;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input('rows') set rows(rows: ITableRow[]) {
    this.dataSource = new MatTableDataSource(rows);
    this.dataSource.paginator = this.paginator;
    this.displayedColumns = this.generateColumns(rows);
  }
  constructor(public odkRest: OdkRestService) {}

  private generateColumns(rows: ITableRow[]) {
    return rows[0] ? this._sortColumns(Object.keys(rows[0])) : [];
  }

  /**
   * Sort data columns alphabetically with metadata keys appearing after rest
   */
  private _sortColumns(keys: string[]) {
    const metaKeys = [];
    const valKeys = [];
    keys.forEach(k => {
      if (k.charAt(0) === '_') metaKeys.push(k);
      else valKeys.push(k);
    });
    return [...valKeys.sort(), ...metaKeys.sort()];
  }
}
