import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
/**
 * Use custom configuration to change what tables and fields are displayed
 * in the list of tables or columns in the table display or editor
 */
export class FieldsDisplayService {
  /** Custom display*/
  fieldsDisplay: IFieldDisplay = { tableGlobal: {}, fieldGlobal: {}, tableField: {} };
  constructor(private http: HttpClient) {
    this.processCustomFieldDisplay();
  }

  /**
   * Check tables against global table hidden exclusions and return filtered list
   * @param tables - an object array to filter on and return
   * @param tableIdKey - object property to lookup to identify the tableId within the tables array
   * */
  filterHiddenTables(tables: any[], tableIdKey = 'tableId') {
    return tables.filter((t) => {
      const tableId = t[tableIdKey];
      return !this.fieldsDisplay.tableGlobal[tableId]?.hidden;
    });
  }

  /**
   * Check fields against global and table-specific hidden exclusions and return filtered list
   * @param tableId - id of table to check against table-specific exclusions
   * @param fields - an object array to filter on and return
   * @param fieldNameKey - object property to lookup to identify the fieldName within the fields array
   */
  filterHiddenFields(tableId: string, fields: any[], fieldNameKey = 'fieldName') {
    return fields.filter((f) => {
      const fieldname = f[fieldNameKey];
      return (
        !this.fieldsDisplay.fieldGlobal[fieldname]?.hidden &&
        !this.fieldsDisplay.tableField[tableId]?.[fieldname]?.hidden
      );
    });
  }

  orderFields(tableId: string, fields: any[], fieldNameKey = 'fieldName') {
    return fields.sort((a, b) => {
      const orderA = this._lookupOrder(tableId, a[fieldNameKey]);
      const orderB = this._lookupOrder(tableId, b[fieldNameKey]);
      return orderA - orderB;
    });
  }

  private _lookupOrder(tableId: string, fieldname: string) {
    return (
      this.fieldsDisplay.fieldGlobal[fieldname]?.order ||
      this.fieldsDisplay.tableField[tableId]?.[fieldname]?.order ||
      Infinity
    );
  }

  /**
   * Load config file from assets folder
   * Note 1 - populated from assets to allow easy override in docker without build
   * Note 2 - use the angular http client as axios client used by odk is proxied
   */
  private async processCustomFieldDisplay() {
    const fieldDisplay: IFieldDisplay = { tableGlobal: {}, fieldGlobal: {}, tableField: {} };
    this.http.get('assets/fieldsDisplay.json').subscribe(
      (rows: IFieldDisplayRow[]) => {
        for (const row of rows) {
          const { tableId, fieldName, disabled, hidden, order } = row;
          const display: IDisplayOptions = {
            disabled: strToBool(disabled),
            hidden: strToBool(hidden),
            order: order || Infinity,
          };
          if (tableId) {
            if (fieldName) {
              // tableField display setting
              fieldDisplay.tableField[tableId] = { ...fieldDisplay.tableField[tableId] };
              fieldDisplay.tableField[tableId][fieldName] = display;
            } else {
              // global table display setting
              fieldDisplay.tableGlobal[tableId] = display;
            }
          } else if (fieldName) {
            // global field display setting
            fieldDisplay.fieldGlobal[fieldName] = display;
          }
        }
        console.log('field display', fieldDisplay);
        this.fieldsDisplay = fieldDisplay;
      },
      // ignore error if file does not exist and just populate template file
      () => null
    );
  }
}

function strToBool(str: string = ''): boolean {
  return str === 'TRUE';
}

interface IFieldDisplay {
  tableGlobal: { [tableId: string]: IDisplayOptions };
  fieldGlobal: { [fieldId: string]: IDisplayOptions };
  tableField: { [tableId: string]: { [fieldId: string]: IDisplayOptions } };
}

interface IDisplayOptions {
  disabled: boolean;
  hidden: boolean;
  order: number;
}

/**
 * When importing data from excel rows include table and field
 * names alongside display options in csv string format
 */
interface IFieldDisplayRow {
  tableId: string;
  fieldName: string;
  disabled: 'TRUE' | '';
  hidden: 'TRUE' | '';
  order: number | null;
}
