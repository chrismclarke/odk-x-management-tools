import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { ITableRow } from '../types/odk.types';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'odkxm-table-data',
  template: `
    <button>Show Meta Columns</button>
    <div class="container">
      <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
        <!--- Note that these columns can be defined in any order.
      The actual rendered columns are set as a property on the row definition" -->

        <!-- Data Columns -->
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
  dataSource: MatTableDataSource<any[]>;
  displayedColumns: string[] = [];
  showMeta = true;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input('rows') set rows(rows: ITableRow[]) {
    this.dataSource = new MatTableDataSource(this.generateDatasource(rows));
    this.dataSource.paginator = this.paginator;
    this.displayedColumns = this.generateColumns(rows);
  }
  constructor() {}

  private generateDatasource(rows: ITableRow[]) {
    console.log('generating data source', rows);
    const datasource = [];
    rows.forEach(row => {
      // take copy for field deletion
      const r = { ...row };
      const data: any = {};
      // assign data fields
      r.orderedColumns.forEach(el => {
        const { column, value } = el;
        data[column] = value;
      });
      delete r.orderedColumns;
      // re-assign meta fields
      Object.entries(r).forEach(([key, value]) => {
        data[`_${key}`] = value;
      });
      datasource.push(data);
    });
    return datasource;
  }

  private generateColumns(rows: ITableRow[]) {
    console.log('generate columnns', rows);
    return rows[0] ? rows[0].orderedColumns.map(c => c.column) : [];
  }
}
