import { Component, Input, ViewChild } from '@angular/core';
import { ITableRow } from '../types/odk.types';
import { MatPaginator } from '@angular/material/paginator';
import { OdkRestService } from '../services/odkrest.service';
import { AgGridColumn } from 'ag-grid-angular';
import { GridApi, DetailGridInfo, ColumnApi } from 'ag-grid-community';

@Component({
  selector: 'odkxm-table-data',
  template: `
    <ag-grid-angular
      style="width: 100%; height: 100%"
      class="ag-theme-alpine"
      [rowData]="rowData"
      [columnDefs]="displayedColumns"
      (firstDataRendered)="onFirstDataRendered($event)"
    >
    </ag-grid-angular>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .container {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 1em;
      }
    `,
  ],
})
export class TableDataComponent {
  rowData: ITableRow[];
  displayedColumns: Partial<AgGridColumn>[] = [];
  showMeta = true;
  columnApi: ColumnApi;
  gridApi: GridApi;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input('rows') set rows(rows: ITableRow[]) {
    this.rowData = rows;
    this.displayedColumns = this.generateColumns(rows).map((col) => ({
      field: col,
      sortable: true,
      filter: true,
      resizable: true,
    }));
  }
  constructor(public odkRest: OdkRestService) {}

  /**
   * Provide access to grid methods once initial render complete
   */
  onFirstDataRendered(params: DetailGridInfo) {
    const { columnApi, api } = params;
    this.gridApi = api;
    this.columnApi = columnApi;
  }

  private generateColumns(rows: ITableRow[]) {
    return rows[0] ? this._sortColumns(Object.keys(rows[0])) : [];
  }

  /**
   * Sort data columns alphabetically with metadata keys appearing after rest
   */
  private _sortColumns(keys: string[]) {
    const metaKeys = [];
    const valKeys = [];
    keys.forEach((k) => {
      if (k.charAt(0) === '_') metaKeys.push(k);
      else valKeys.push(k);
    });
    return [...valKeys.sort(), ...metaKeys.sort()];
  }
}
