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
  Savepoint,
  ITableMetaColumnKey
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

  async getAllTableRows() {
    const appId = this.appId$.value;
    const promises = this.allTables$.value.map(async table => {
      const { tableId, schemaETag } = table;
      const res = await this.getRows(appId, tableId, schemaETag);
      return { tableId, rows: this._convertODKRowsForExport(res.rows) };
    });
    return Promise.all(promises);
  }

  /**
   * By default ODK rest returns rows with metadata and values defined in
   * a different format to how it is shown and exported in app
   * - Convert metadata fields to snake_case and prefix with underscore,
   * - De-nest filterScope and add to metadata prefixed with _group
   * - De-nest orderedColumns and extract to variable values
   * - Delete various fields
   * - Match metafield order as specified in SyncClient.java
   */
  private _convertODKRowsForExport(rows: IResTableRow[]): ITableRow[] {
    const converted = [];
    rows.forEach(row => {
      const data: any = {};
      // create mapping for all fields as snake case, and un-nest filtersocpe fields
      const { filterScope } = row;
      Object.entries(filterScope).forEach(([key, value]) => {
        row[`_${this._camelToSnake(key)}`] = value;
      });
      Object.entries(row).forEach(([key, value]) => {
        row[`_${this._camelToSnake(key)}`] = value;
      });
      const metadataColumns1: ITableMetaColumnKey[] = [
        '_id',
        '_form_id',
        '_locale',
        '_savepoint_type',
        '_savepoint_timestamp',
        '_savepoint_creator',
        '_deleted',
        '_data_etag_at_modification'
      ];
      // some metadata columns go to front
      metadataColumns1.forEach(col => (data[col] = row[col]));
      // main data in centre
      row.orderedColumns.forEach(el => {
        const { column, value } = el;
        data[column] = value;
      });
      const metadataColumns2: ITableMetaColumnKey[] = [
        '_default_access',
        '_group_modify',
        '_group_privileged',
        '_group_read_only',
        '_row_etag',
        '_row_owner'
      ];
      // other metadata columns go to back
      metadataColumns2.forEach(col => (data[col] = row[col]));
      converted.push(data);
    });
    console.log('converted', converted);
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

  private getAppLevelFileManifest(odkClientVersion = 2) {
    const path = `default/manifest/${odkClientVersion}`;
    return this.get<{ files: IManifestItem[] }>(path);
  }

  private getTableIdFileManifest(tableId: string, odkClientVersion = 2) {
    const path = `default/manifest/${odkClientVersion}/${tableId}`;
    return this.get<{ files: IManifestItem[] }>(path);
  }

  /**
   * Upload App-Level File
   * @param filepath - relative path on server, e.g. tables/exampleTable/definition.csv
   */
  private putFile(
    filePath: string,
    fileData: Buffer,
    contentType: string,
    odkClientVersion = 2,
    appId = 'default'
  ) {
    // app files and table files have different endpoints
    return this.post(
      `${appId}/files/${odkClientVersion}/${filePath}`,
      fileData,
      {
        'content-type': contentType + '; charset=utf-8',
        accept: contentType,
        'accept-charset': 'utf-8'
      }
    );
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
  private async post<ResponseDataType = any>(
    path: string,
    body: any,
    headers = {}
  ): Promise<ResponseDataType> {
    try {
      const postHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        ...headers
      });
      return (
        await this.http
          .put<IAPIResponse>(`/odktables/${path}`, body, {
            headers: postHeaders
          })
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
interface IManifestItem {
  filename: string;
  contentLength: number;
  contentType: string;
  md5hash: string;
  downloadUrl: string;
}
