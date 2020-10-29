import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { AgGridColumn } from 'ag-grid-angular';
import { GridApi, DetailGridInfo, ColumnApi } from 'ag-grid-community';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
// import { MenuModule } from '@ag-grid-enterprise/menu';
// import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ITableRow } from '../types/odk.types';
import { OdkRestService } from '../services/odkrest.service';

@Component({
  selector: 'odkxm-table-data',
  template: `
    <div style="height:100%; display:flex; flex-direction:column">
      <mat-form-field class="filter-input-field">
        <mat-icon matPrefix style="margin-right:5px">search</mat-icon>
        <input
          matInput
          type="search"
          #quickFilterInput
          (input)="onQuickFilterChanged(quickFilterInput.value)"
          placeholder="Search data"
          autocomplete="off"
        />
        <button
          mat-button
          *ngIf="quickFilterInput.value"
          matSuffix
          mat-icon-button
          aria-label="Clear"
          (click)="quickFilterInput.value = ''; onQuickFilterChanged('')"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
      <ag-grid-angular
        style="flex:1"
        class="ag-theme-alpine"
        [modules]="modules"
        [rowData]="rowData"
        [columnDefs]="displayedColumns"
        [defaultColDef]="columnDefaults"
        (firstDataRendered)="onFirstDataRendered($event)"
        [frameworkComponents]="frameworkComponents"
        [enableCellTextSelection]="false"
        (selectionChanged)="onSelectionChanged($event)"
        rowSelection="single"
        (cellValueChanged)="onCellValueChanged($event)"
      >
      </ag-grid-angular>
    </div>
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
      .filter-input-field {
        width: 200px;
        margin-bottom: 1em;
        background: white;
        padding: 5px;
        border: 1px solid #0000003d;
        border-radius: 5px;
      }
      .filter-input-field .mat-form-field-wrapper {
        margin-bottom: -1.25em;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class TableDataComponent {
  public rowData: ITableRow[];
  public displayedColumns: Partial<AgGridColumn>[] = [];
  private columnApi: ColumnApi;
  private gridApi: GridApi;
  public columnDefaults: Partial<AgGridColumn>;
  public modules = [
    // ClientSideRowModelModule,
    // RichSelectModule,
    // MenuModule,
    // ColumnsToolPanelModule,
  ];
  public frameworkComponents = { testCellRenderer: null };

  @Output() 'selectedRowChange' = new EventEmitter<ITableRow[]>();
  @Input('rows') set rows(rows: ITableRow[]) {
    this.rowData = rows;
    this.displayedColumns = this.generateColumns(rows).map((col) => ({
      field: col,
      editable: col.charAt(0) !== '_',
      cellEditor: this._selectCellEditor(col),
      cellEditorParams: (params) => {
        console.log('set editor params', params);
        return {
          values: ['test1', 'test2'],
          cellRenderer: 'testCellRenderer',
        };
      },
    }));
  }

  constructor(public odkRest: OdkRestService) {
    this.columnDefaults = {
      sortable: true,
      filter: true,
      resizable: true,
      initialWidth: 150,
    };
  }
  onCellValueChanged(params) {
    console.log('cell value changed', params);
  }

  /**
   * Provide access to grid methods once initial render complete
   */
  onFirstDataRendered(params: DetailGridInfo) {
    const { columnApi, api } = params;
    this.gridApi = api;
    this.columnApi = columnApi;
  }
  onQuickFilterChanged(searchValue: string) {
    this.gridApi.setQuickFilter(searchValue);
  }
  onSelectionChanged() {
    // const selected = this.gridApi.getSelectedRows();
    // this.selectedRowChange.next(selected);
  }

  private _selectCellEditor(column: string) {
    // TODO - lookup datatype
    const datatype: string = 'string' as any;
    switch (datatype) {
      case 'string':
        return 'agTextCellEditor';
      // included editors: https://www.ag-grid.com/javascript-grid-provided-cell-editors/
      default:
        if (datatype.includes('string(')) {
          return 'agLargeTextCellEditor';
        }
        throw new Error('no cell editor for data format: ' + datatype);
    }
  }

  /**
   * Use the list of keys from the first row to define columns
   */
  private generateColumns(rows: ITableRow[]): string[] {
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
