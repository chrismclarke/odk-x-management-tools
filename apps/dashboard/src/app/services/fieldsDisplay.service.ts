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

  getTableHidden(tableId: string) {
    return this.fieldsDisplay.tableGlobal[tableId]?.hidden ? true : false;
  }
  getFieldHidden(tableId: string, fieldName: string) {
    return (
      this.fieldsDisplay.fieldGlobal[fieldName]?.hidden ||
      this.fieldsDisplay.tableField[tableId]?.[fieldName]?.hidden
    );
  }
  getFieldDisabled(tableId: string, fieldName: string) {
    return (
      this.fieldsDisplay.fieldGlobal[fieldName]?.disabled ||
      this.fieldsDisplay.tableField[tableId]?.[fieldName]?.disabled
    );
  }
  getFieldOrder(tableId: string, fieldName: string) {
    return (
      this.fieldsDisplay.fieldGlobal[fieldName]?.order ||
      this.fieldsDisplay.tableField[tableId]?.[fieldName]?.order ||
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
    this.http
      .get('assets/fieldsDisplay.json', {
        responseType: 'json',
        headers: { 'Cache-Control': 'no-cache' },
      })
      .subscribe(
        (rows: IFieldDisplayRow[]) => {
          console.log('loaded fields display rows', rows);
          for (const row of rows) {
            const { tableId, fieldName, disabled, hidden, order } = row;
            const display: IDisplayOptions = {
              disabled: strToBool(disabled),
              hidden: strToBool(hidden),
              order: order ? order : null,
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
          this.fieldsDisplay = fieldDisplay;
          console.log('fieldsDisplay', fieldDisplay);
        },
        // ignore error if file does not exist and just populate template file
        (err) => console.log('could not load fields display', err)
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
