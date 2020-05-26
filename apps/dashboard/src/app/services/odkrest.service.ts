import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IAPIResponse } from '@odkxm/api-interfaces';
import { BehaviorSubject } from 'rxjs';
import {
  ITableMeta,
  IUserPriviledge,
  ITableRow,
  ITableSchema,
  AccessLevel,
  BoolString,
  ISOString,
  Savepoint
} from '../types/odk.types';

@Injectable({ providedIn: 'root' })
export class OdkRestService {
  // observable properties for use in components
  allAppIds$: BehaviorSubject<string[]>;
  allTables$: BehaviorSubject<ITableMeta[]>;
  appId$: BehaviorSubject<string>;
  table$: BehaviorSubject<ITableMeta>;
  tableRows$: BehaviorSubject<ITableRow[]>;
  userPriviledges$: BehaviorSubject<IUserPriviledge>;

  constructor(private http: HttpClient) {
    this.init();
  }
  /**
   * Initialise observers
   * @remark - moved outside declaration and constructor
   * to allow disconnect reset function
   */
  private init() {
    this.allAppIds$ = new BehaviorSubject([]);
    this.allTables$ = new BehaviorSubject([]);
    this.appId$ = new BehaviorSubject(undefined);
    this.table$ = new BehaviorSubject(undefined);
    this.tableRows$ = new BehaviorSubject([]);
    this.userPriviledges$ = new BehaviorSubject(undefined);
  }

  /********************************************************
   * Public methods exposed to components
   *********************************************************/
  /**
   *  On initial connect, attempt to load list of apps
   *  and set current app as default.
   *  @returns - boolean depending on connection success
   */
  async connect() {
    const appIds = await this.get<string[] | null>('');
    if (appIds) {
      this.allAppIds$.next(appIds);
      this.setActiveAppId(appIds[0]);
      return true;
    }
    return false;
  }
  disconnect() {
    this.init();
  }
  /**
   * Set the active app id, triggering calls to retrieve
   * table data and user priviledges for the app
   */
  setActiveAppId(appId: string) {
    this.appId$.next(appId);
    this.getPriviledgesInfo();
    this.getTables();
  }
  async setActiveTable(table: ITableMeta | undefined) {
    console.log('setting active table', table);
    this.table$.next(table);
    this.tableRows$.next([]);
    if (table) {
      const appId = this.appId$.value;
      const { tableId, schemaETag } = table;
      const { rows } = await this.getRows(appId, tableId, schemaETag);
      this.tableRows$.next(this._convertODKRowsForExport(rows));
    }
  }
  async backupCurrentTable(backupTableId: string) {
    const appId = this.appId$.value;
    const { tableId, schemaETag } = this.table$.value;
    const schema = await this.getDefinition(appId, tableId, schemaETag);
    const { orderedColumns } = schema;
    const backupSchema: ITableSchema = {
      schemaETag: `uuid:${UUID().toString()}`,
      tableId: backupTableId,
      orderedColumns
    };
    const backup = await this.createTable(backupSchema);
    console.log('backup table res', backup);
    // fetch rows again instead of using converted as easier to modify
    let { rows } = await this.getRows(appId, tableId, schemaETag);
    rows = rows.map(r => {
      // selfUri property not supported on put request
      delete r.selfUri;
      r.dataETagAtModification = backup.dataETag;
      return r;
    });
    const rowList = { rows, dataETag: backup.dataETag };
    const res = await this.alterRows(
      appId,
      backup.tableId,
      backup.schemaETag,
      rowList
    );
    // TODO - handle response related to row outcomes
    console.log('bakup res', res);
    await this.getTables();
    await this.setActiveTable(backup);
  }
  async deleteCurrentTable() {
    const appId = this.appId$.value;
    const { tableId, schemaETag } = this.table$.value;
    await this.deleteTable(appId, tableId, schemaETag);
    await this.setActiveTable(undefined);
    return this.getTables();
  }

  /**
   * By default ODK rest returns rows with metadata and values defined in
   * a different format to how it is shown and exported in app
   * - Convert metadata fields to snake_case and prefix with underscore,
   * - De-nest filterScope and add to metadata prefixed with _group
   * - De-nest orderedColumns and extract to variable values
   * - Delete various fields
   */
  private _convertODKRowsForExport(rows: IResTableRow[]): ITableRow[] {
    const converted = [];
    rows.forEach(row => {
      // take copy for field deletion
      const r: IResTableRow = { ...row };
      // TODO - types won't be strongly checked, so need to double-check code is correct
      const data: any = {};
      // assign data fields
      r.orderedColumns.forEach(el => {
        const { column, value } = el;
        data[column] = value;
      });
      // assign scope field
      const { filterScope } = r;
      Object.entries(filterScope).forEach(([key, value]) => {
        data[`_${this._camelToSnake(key)}`] = value;
      });
      delete r.orderedColumns;
      delete r.dataETagAtModification;
      delete r.filterScope;
      delete r.selfUri;
      Object.entries(r).forEach(([key, value]) => {
        data[`_${this._camelToSnake(key)}`] = value;
      });
      converted.push(data);
    });
    return converted;
  }
  /**
   * String convert util
   * @example rowETag -> row_etag
   */
  private _camelToSnake(str: string) {
    return str
      .replace(/[\w]([A-Z])/g, function(m) {
        return m[0] + '_' + m[1];
      })
      .toLowerCase();
  }

  /********************************************************
   * Implementation of specific ODK Rest Functions
   * https://docs.odk-x.org/odk-2-sync-protocol/
   * TODO - remove all local state management to better reflect odk-x sync
   *********************************************************/
  private async getPriviledgesInfo() {
    this.userPriviledges$.next(undefined);
    const appId = this.appId$.value;
    const path = `${appId}/privilegesInfo`;
    const userPriviledges = await this.get<IResUserPriviledge>(path);
    console.log('user priviledges', userPriviledges);
    if (userPriviledges) {
      this.userPriviledges$.next(userPriviledges);
    }
  }
  private async getTables() {
    this.allTables$.next([]);
    const appId = this.appId$.value;
    const path = `${appId}/tables`;
    const res = await this.get<IResTables>(path);
    if (res) {
      this.allTables$.next(res.tables);
      console.log('tables ids loaded', res.tables);
    }
  }
  private async getDefinition(
    appId: string,
    tableId: string,
    schemaETag: string
  ) {
    const path = `${appId}/tables/${tableId}/ref/${schemaETag}`;
    return this.get<IResSchema>(path);
  }
  private async getRows(appId: string, tableId: string, schemaETag: string) {
    const path = `${appId}/tables/${tableId}/ref/${schemaETag}/rows`;
    return this.get<IResTableRows>(path);
  }

  private async createTable(schema: ITableSchema) {
    const appId = this.appId$.value;
    const { tableId } = schema;
    const path = `${appId}/tables/${tableId}`;
    return this.put<IResTableCreate>(path, schema);
  }

  private alterRows(
    appId: string,
    tableId: string,
    schemaETag: string,
    rows: RowList
  ) {
    const path = `${appId}/tables/${tableId}/ref/${schemaETag}/rows`;
    return this.put(path, rows);
  }

  private deleteTable(appId: string, tableId: string, schemaETag: string) {
    const path = `${appId}/tables/${tableId}/ref/${schemaETag}`;
    return this.delete(path);
  }

  /********************************************************
   * Rest call wrappers
   * Proxied to local server via interceptor
   *
   * @param path: See full list at https://docs.odk-x.org/odk-2-sync-protocol/
   * @returns - response data
   *********************************************************/

  private async get<ResponseDataType = any>(
    path: string
  ): Promise<ResponseDataType> {
    try {
      return (
        await this.http.get<IAPIResponse>(`/odktables/${path}`).toPromise()
      ).data;
    } catch (error) {
      return this.handleErr(error);
    }
  }
  private async put<ResponseDataType = any>(
    path: string,
    body: any
  ): Promise<ResponseDataType> {
    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      return (
        await this.http
          .put<IAPIResponse>(`/odktables/${path}`, body, { headers })
          .toPromise()
      ).data;
    } catch (error) {
      return this.handleErr(error);
    }
  }
  private async delete<ResponseDataType = any>(
    path: string
  ): Promise<ResponseDataType> {
    try {
      return (
        await this.http.delete<IAPIResponse>(`/odktables/${path}`).toPromise()
      ).data;
    } catch (error) {
      return this.handleErr(error);
    }
  }
  private handleErr(error) {
    // TODO - add error handler/notification (or leave to logger interceptor)
    console.error(error);
    throw new Error(error.message);
    return null;
  }
}

/********************************************************
 * Helper functions
 *********************************************************/

// Simple implementation of UUIDv4
// tslint:disable no-bitwise
function UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/********************************************************
 * Service-specific interfaces
 *********************************************************/
interface IResTables extends IResBase {
  appLevelManifestETag: string;
  tables: ITableMeta[];
}
interface IResTableRows extends IResBase {
  dataETag: string;
  rows: IResTableRow[];
  tableUri: string;
}
interface IResTableRow {
  createUser: string;
  dataETagAtModification: string;
  deleted: false;
  filterScope: {
    defaultAccess: AccessLevel;
    rowOwner: string;
    groupReadOnly: BoolString;
    groupModify: BoolString;
    groupPrivileged: BoolString;
  };
  formId: string;
  id: string;
  lastUpdateUser: string;
  locale: string;
  orderedColumns: IResTableColumn[];
  rowETag: string;
  savepointCreator: string;
  savepointTimestamp: ISOString;
  savepointType: Savepoint;
  selfUri: string;
}
interface IResTableColumn {
  column: string;
  value: any;
}
interface IResAlterRows {
  dataETag: string;
  rows: ITableRowAltered[];
  tableUri: string;
}
interface ITableRowAltered extends ITableRow {
  outcome: 'UNKNOWN' | 'SUCCESS' | 'DENIED' | 'IN_CONFLICT' | 'FAILED';
}
interface IResTableCreate {
  tableId: string;
  dataETag: string;
  schemaETag: string;
  selfUri: string;
  definitionUri: string;
  dataUri: string;
  instanceFilesUri: string;
  diffUri: string;
  aclUri: string;
  tableLevelManifestETag: null;
}
interface IResBase {
  hasMoreResults: boolean;
  hasPriorResults: boolean;
  webSafeBackwardCursor: string;
  webSafeRefetchCursor: null;
  webSafeResumeCursor: string;
}
interface IResSchema extends ITableSchema {
  selfUri: string;
  tableUri: string;
}

type IResUserPriviledge = IUserPriviledge;
interface RowList {
  // rows not technically partial, but same without selfUri info
  rows: Partial<IResTableRow>[];
  dataETag: string;
}
