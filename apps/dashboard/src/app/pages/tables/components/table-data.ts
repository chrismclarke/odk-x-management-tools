import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { AgGridColumn } from 'ag-grid-angular';
import {
  GridApi,
  DetailGridInfo,
  ColumnApi,
  CellValueChangedEvent,
  Column,
} from 'ag-grid-community';
import { FieldsDisplayService } from '../../../services/fieldsDisplay.service';
import { OdkService } from '../../../services/odk';
import { ITableRow, ITableSchema } from '../../../types/odk.types';

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
        rowSelection="single"
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
      }
      .cell.field-display-disabled,
      .header.field-display-disabled {
        opacity: 0.7;
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

  @Output() 'cellSelected' = new EventEmitter<any>();
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

  constructor(public odkService: OdkService, private fieldsDisplayService: FieldsDisplayService) {
    this.columnDefaults = {
      sortable: true,
      filter: true,
      resizable: true,
      initialWidth: 150,
      cellClass: 'cell',
    };
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
  onCellClicked(e: CellValueChangedEvent) {
    const rowData = e.data as ITableRow;
    const colId = (e.column as any).colId;
    this.cellSelected.next({ rowData, colId });
  }

  private generateColumns(schema: ITableSchema) {
    const { orderedColumns } = schema;
    const displayColumns: Partial<AgGridColumn>[] = orderedColumns.map((c) => {
      return {
        field: c.elementKey,
        onCellClicked: (e: CellValueChangedEvent) => this.onCellClicked(e),
        cellClass: 'cell',
        headerClass: 'header',
      };
    });
    // Add non-editable metadata keys at start and end of table
    Object.entries(META_MAPPING).forEach(([key, position]) => {
      const mapping: Partial<AgGridColumn> = {
        field: key,
        cellClass: 'cell non-editable',
        onCellClicked: (e: CellValueChangedEvent) => this.onCellClicked(e),
      };
      if (position === 'start') {
        displayColumns.unshift(mapping);
      } else {
        displayColumns.push(mapping);
      }
    });
    // format and reorder columns according to fields display settings
    const { tableId } = this.odkService.table$.value;
    const columnsWithDisplayClass = displayColumns.map((c) => {
      const isHidden = this.fieldsDisplayService.getFieldHidden(tableId, c.field);
      const isDisabled = this.fieldsDisplayService.getFieldDisabled(tableId, c.field);
      if (isHidden) {
        c.hide = true;
      }
      if (isDisabled) {
        c.cellClass += ' field-display-disabled';
        c.headerClass += ' field-display-disabled';
      }
      return c;
    });
    const reOrderedColumns = columnsWithDisplayClass.sort((a, b) => {
      return (
        this.fieldsDisplayService.getFieldOrder(tableId, a.field) -
        this.fieldsDisplayService.getFieldOrder(tableId, b.field)
      );
    });

    return reOrderedColumns;
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
