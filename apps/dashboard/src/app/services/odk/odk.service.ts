import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { IAPIResponse } from '@odkxm/api-interfaces';
import { BehaviorSubject } from 'rxjs';
import * as IODK from '../../types/odk.types';
import OdkRestService from './odk.rest';
import { NotificationService } from '../notification.service';
import * as ODKUtils from './odk.utils';

@Injectable({ providedIn: 'root' })
export class OdkService {
  // observable properties for use in components
  allAppIds$: BehaviorSubject<string[]>;
  allTables$: BehaviorSubject<IODK.ITableMeta[]>;
  appId$: BehaviorSubject<string>;
  table$: BehaviorSubject<IODK.ITableMeta>;
  tableRows$: BehaviorSubject<IODK.ITableRow[]>;
  tableSchema$: BehaviorSubject<IODK.ITableSchema>;
  userPriviledges$: BehaviorSubject<IODK.IUserPriviledge>;
  fetchLimit = localStorage.getItem('fetchLimit') || '50';
  isConnected: BehaviorSubject<boolean>;
  serverUrl: string;
  private _cache: IQueryCache = {};
  private odkRest = new OdkRestService();
  constructor(
    private http: HttpClient,
    private notifications: NotificationService
  ) {
    this.init();
  }
  /**
   * Initialise observers
   * @remark - moved outside declaration and constructor
   * to allow disconnect reset function
   */
  private init() {
    this.serverUrl = null;
    this.tableSchema$ = new BehaviorSubject(undefined);
    this.isConnected = new BehaviorSubject(false);
    this.allAppIds$ = new BehaviorSubject([]);
    this.allTables$ = new BehaviorSubject([]);
    this.appId$ = new BehaviorSubject(undefined);
    this.table$ = new BehaviorSubject(undefined);
    this.tableRows$ = new BehaviorSubject(undefined);
    this.userPriviledges$ = new BehaviorSubject(undefined);
  }

  /********************************************************
   * Public methods exposed to components
   *********************************************************/
  /**
   *  On initial connect, attempt to load list of apps
   *  and set current app as default.
   *  Note, connection is configured in server-login component.
   *  @returns - boolean depending on connection success
   */
  async connect() {
    const appIds = await this.get<string[] | null>('');
    if (appIds) {
      this.allAppIds$.next(appIds);
      this.setActiveAppId(appIds[0]);
      this.isConnected.next(true);
    }
  }
  disconnect() {
    this.init();
  }
  setFetchLimit(limit: number) {
    localStorage.setItem('fetchLimit', `${limit}`);
    this.fetchLimit = `${limit}`;
  }
  /**
   * Set the active app id, triggering calls to retrieve
   * table data and user priviledges for the app
   */
  async setActiveAppId(appId: string) {
    this.userPriviledges$.next(undefined);
    this.appId$.next(appId);
    const userPriviledges = await this.odkRest.getPriviledgesInfo();
    if (userPriviledges) {
      this.userPriviledges$.next(userPriviledges);
    }

    this.getTables();
  }
  /**
   * When setting the active table get the table definition any any rows
   * from the server (or cache if available) and populate to their corresponding
   * behaviour subjects and cache
   */
  async setActiveTable(table: IODK.ITableMeta | undefined) {
    console.log('setting active table', table);
    this.table$.next(table);
    this.tableRows$.next(undefined);
    if (table) {
      const { tableId, schemaETag } = table;
      if (this._cache[tableId]) {
        this.tableSchema$.next(this._cache[tableId].schema);
        this.tableRows$.next(this._cache[tableId].rows);
      } else {
        // TODO - handle in parallel?
        const appId = this.appId$.value;
        const schema = await this.getDefinition(appId, tableId, schemaETag);
        this.tableSchema$.next(schema);
        const { rows } = await this.getRowsInBatch(table);
        const tableRows = ODKUtils.convertODKRowsForExport(rows);
        this.tableRows$.next(tableRows);
        this._cache[tableId] = { schema, rows: tableRows };
      }
    }
  }
  /**
   * Use paged queries to get all rows and avoid timeout/size issues
   */
  async getRowsInBatch(
    table: IODK.ITableMeta,
    allRows = [],
    cursor = null
  ): Promise<IResTableRows> {
    const { tableId, schemaETag } = table;
    const params: any = { fetchLimit: this.fetchLimit };
    if (cursor) {
      params.cursor = cursor;
    }
    const res = await this.getRows(
      this.appId$.value,
      tableId,
      schemaETag,
      params
    );
    const { hasMoreResults, webSafeResumeCursor, rows } = res;
    allRows = [...allRows, ...rows];
    if (hasMoreResults) {
      return this.getRowsInBatch(table, allRows, webSafeResumeCursor);
    }
    return { ...res, rows: allRows };
  }
  async updateRows(tableRows: IODK.ITableRow[]) {
    const appId = this.appId$.value;
    const { tableId, schemaETag, dataETag } = this.table$.value;
    console.log('updating rows', tableId, schemaETag, dataETag);
    // TODO - check if rows need to be converted
    const rows = tableRows as any;
    const res = await this.alterRows(appId, tableId, schemaETag, {
      rows,
      dataETag,
    });
    console.log('res', res);
  }
  async backupCurrentTable(backupTableId: string) {
    const appId = this.appId$.value;
    const { tableId, schemaETag } = this.table$.value;
    const schema = await this.getDefinition(appId, tableId, schemaETag);
    const { orderedColumns } = schema;
    const backupSchema: IODK.ITableSchema = {
      schemaETag: `uuid:${UUID().toString()}`,
      tableId: backupTableId,
      orderedColumns,
    };
    const backup = await this.createTable(backupSchema);
    console.log('backup table res', backup);
    // fetch rows again instead of using converted as easier to modify
    let { rows } = await this.getRowsInBatch(this.table$.value);
    rows = rows.map((r) => {
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
    const promises = this.allTables$.value.map(async (table) => {
      const { tableId, schemaETag } = table;
      const res = await this.getRows(appId, tableId, schemaETag);
      return { tableId, rows: ODKUtils.convertODKRowsForExport(res.rows) };
    });
    return Promise.all(promises);
  }

  /********************************************************
   * Implementation of specific ODK Rest Functions
   * https://docs.odk-x.org/odk-2-sync-protocol/
   * TODO - remove all local state management to better reflect odk-x sync
   *********************************************************/

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
  private async getRows(
    appId: string,
    tableId: string,
    schemaETag: string,
    params = {}
  ) {
    const path = `${appId}/tables/${tableId}/ref/${schemaETag}/rows`;
    return this.get<IResTableRows>(path, params);
  }

  private async createTable(schema: IODK.ITableSchema) {
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
        'accept-charset': 'utf-8',
      }
    );
  }

  private deleteFile(
    filePath: string,
    odkClientVersion = 2,
    appId = 'default'
  ) {
    return this.delete(`${appId}/files/${odkClientVersion}/${filePath}`);
  }

  /********************************************************
   * Rest call wrappers
   * Proxied to local server via interceptor
   *
   * @param path: See full list at https://docs.odk-x.org/odk-2-sync-protocol/
   * @returns - response data
   *********************************************************/

  private async get<ResponseDataType = any>(
    path: string,
    params: { [param: string]: string } = {}
  ): Promise<ResponseDataType> {
    try {
      return (
        await this.http
          .get<IAPIResponse>(`/odktables/${path}`, { params })
          .toPromise()
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
        'Content-Type': 'application/json',
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
        ...headers,
      });
      return (
        await this.http
          .put<IAPIResponse>(`/odktables/${path}`, body, {
            headers: postHeaders,
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
  private handleErr(error: any) {
    // TODO - add error handler/notification (or leave to logger interceptor)
    console.error(error);
    try {
      const { status, statusText } = error;
      this.notifications.showErrorMessage(
        `Request failed with response ${status} - ${statusText}`
      );
    } catch (error) {
      this.notifications.showErrorMessage(error.message);
    }
    throw error;
    return null;
  }
}

/********************************************************
 * Helper functions
 *********************************************************/

// Simple implementation of UUIDv4
// tslint:disable no-bitwise
function UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
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
  tables: IODK.ITableMeta[];
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
    defaultAccess: IODK.AccessLevel;
    rowOwner: string;
    groupReadOnly: IODK.BoolString;
    groupModify: IODK.BoolString;
    groupPrivileged: IODK.BoolString;
  };
  formId: string;
  id: string;
  lastUpdateUser: string;
  locale: string;
  orderedColumns: IResTableColumn[];
  rowETag: string;
  savepointCreator: string;
  savepointTimestamp: IODK.ISOString;
  savepointType: IODK.Savepoint;
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
interface ITableRowAltered extends IODK.ITableRow {
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
interface IResSchema extends IODK.ITableSchema {
  selfUri: string;
  tableUri: string;
}

type IResUserPriviledge = IODK.IUserPriviledge;
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
interface IQueryCache {
  [tableId: string]: {
    schema: IODK.ITableSchema;
    rows: IODK.ITableRow[];
  };
}
