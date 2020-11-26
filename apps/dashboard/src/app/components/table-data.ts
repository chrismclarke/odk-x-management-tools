import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { AgGridColumn } from 'ag-grid-angular';
import {
  GridApi,
  DetailGridInfo,
  ColumnApi,
  CellValueChangedEvent,
} from 'ag-grid-community';
import { ITableRow, ITableSchema } from '../types/odk.types';
import { OdkService } from '../services/odk';

@Component({
  selector: 'odkxm-table-data',
  encapsulation: ViewEncapsulation.None,
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
        [rowData]="rowData"
        [columnDefs]="displayedColumns"
        [defaultColDef]="columnDefaults"
        (firstDataRendered)="onFirstDataRendered($event)"
        [frameworkComponents]="frameworkComponents"
        [enableCellTextSelection]="false"
        (selectionChanged)="onSelectionChanged()"
        rowSelection="single"
        (cellValueChanged)="onCellValueChanged($event)"
        [undoRedoCellEditing]="true"
        [undoRedoCellEditingLimit]="20"
        [enableCellChangeFlash]="true"
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
      .cell {
        cursor: pointer;
      }
      .cell.non-editable {
        opacity: 0.7;
        cursor: default;
      }
    `,
  ],
})
export class TableDataComponent {
  public rowData: ITableRow[];
  public displayedColumns: Partial<AgGridColumn>[] = [];
  private columnApi: ColumnApi;
  private gridApi: GridApi;
  public columnDefaults: Partial<AgGridColumn>;
  public frameworkComponents = { testCellRenderer: null };
  public tableEdits: ITableEdit[] = [];

  @Output() 'selectedRowChange' = new EventEmitter<ITableRow[]>();
  @Output() 'tableEditsChange' = new EventEmitter<ITableEdit[]>();
  @Input('rows') set rows(rows: ITableRow[]) {
    this.tableEdits = [];
    this.rowData = rows;
  }
  @Input('schema') set schema(schema: ITableSchema) {
    if (schema) {
      console.log('table schema', schema);
      this.displayedColumns = this.generateColumns(schema);
    } else {
      this.displayedColumns = [];
    }
  }

  constructor(public odkService: OdkService) {
    this.columnDefaults = {
      sortable: true,
      filter: true,
      resizable: true,
      initialWidth: 150,
      cellClass: 'cell',
    };
  }
  onCellValueChanged(params: CellValueChangedEvent) {
    const rowField = (params.column as any).colId;
    const { oldValue, newValue, data } = params;
    this.tableEdits.push({ rowField, oldValue, newValue, rowData: data });
    this.tableEditsChange.next(this.tableEdits);
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
    const selected = this.gridApi.getSelectedRows();
    this.selectedRowChange.next(selected);
  }

  private generateColumns(schema: ITableSchema) {
    const { orderedColumns } = schema;
    const displayColumns: Partial<AgGridColumn>[] = orderedColumns.map((c) => {
      const { cellEditor, cellEditorParams } = this.getCellEditor(c);
      return {
        field: c.elementKey,
        // editable: c.elementKey.charAt(0) !== '_',
        cellEditor,
        cellEditorParams,
      };
    });
    // Add non-editable metadata keys at start and end of table
    Object.entries(META_MAPPING).forEach(([key, position]) => {
      const mapping: Partial<AgGridColumn> = {
        field: key,
        cellClass: 'cell non-editable',
      };
      if (position === 'start') {
        displayColumns.unshift(mapping);
      } else {
        displayColumns.push(mapping);
      }
    });
    return displayColumns;
  }

  private getCellEditor(columnMeta: ITableSchema['orderedColumns'][0]) {
    const cellEditor = specifyEditorType(columnMeta.elementType);
    const cellEditorParams = specifyEditorParams(columnMeta.elementType);

    return { cellEditor, cellEditorParams };

    function specifyEditorType(elementType: string) {
      // TODO - add support for all datatypes
      // TODO - add support for reading select question types, and returning choice picker with correct options
      switch (elementType) {
        case 'string':
          return 'agTextCellEditor';
        // included editors: https://www.ag-grid.com/javascript-grid-provided-cell-editors/
        default:
          if (elementType.includes('string(')) {
            return 'agLargeTextCellEditor';
          }
        // should be fine as string entries are re-processed server side
        // console.warn(
        //   `editing [${elementType}] as string`,
        //   columnMeta.elementKey
        // );
      }
    }
    function specifyEditorParams(elementType: string) {
      switch (elementType) {
        default:
          return {};
      }
    }
  }
}

export interface ITableEdit {
  rowField: string;
  oldValue: any;
  newValue: any;
  rowData: ITableRow;
}

/**
 * Simple mapping of all metadata keys, indicating which should appear at the start of the
 * table and which will appear at the end
 */
const META_MAPPING: { [key in keyof ITableRow]: 'start' | 'end' } = {
  _data_etag_at_modification: 'end',
  _default_access: 'end',
  _deleted: 'end',
  _form_id: 'end',
  _group_modify: 'end',
  _group_privileged: 'end',
  _group_read_only: 'end',
  _id: 'end',
  _locale: 'end',
  _row_etag: 'start',
  _row_owner: 'end',
  _savepoint_creator: 'end',
  _savepoint_timestamp: 'start',
  _savepoint_type: 'end',
};
