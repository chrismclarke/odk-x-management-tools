import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IAPIResponse } from '@odkxm/api-interfaces';
import { BehaviorSubject } from 'rxjs';
import {
  ITableMeta,
  IUserPriviledge,
  ITableRow,
  ITableSchema
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
   * to allow reset
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
    console.log('app id set', appId);
  }
  setActiveTable(table: ITableMeta) {
    console.log('setting table', table);
    this.table$.next(table);
    this.getRows();
    console.log('table set', table);
  }
  async backupTable(table: ITableMeta, tableRows: ITableRow[]) {
    console.log('getting definition', table);
    const schema = await this.getDefinition(table);
    const { orderedColumns, tableId } = schema;
    console.log('schema', schema);
    // store epoch timestamp as suffix
    const suffix = new Date().getTime();
    const backup: ITableSchema = {
      schemaETag: `uuid:${UUID().toString()}`,
      tableId: `${tableId}_${suffix}`,
      orderedColumns
    };
    console.log('creating backup', backup);
    await this.createTable(backup);
    await this.alterRows(backup, tableRows);
  }

  /********************************************************
   * Implementation of specific ODK Rest Functions
   * https://docs.odk-x.org/odk-2-sync-protocol/
   * TODO - could be made more pure, moving local state management
   * and variable generation to methods above (maybe when refactor to store)
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
  private async getDefinition(table: ITableMeta) {
    const appId = this.appId$.value;
    const { tableId, schemaETag } = table;
    const path = `${appId}/tables/${tableId}/ref/${schemaETag}`;
    return this.get<IResSchema>(path);
  }
  private async getRows() {
    this.tableRows$.next([]);
    const appId = this.appId$.value;
    const { tableId, schemaETag } = this.table$.value;
    const path = `${appId}/tables/${tableId}/ref/${schemaETag}/rows`;
    const res = await this.get<IResTableRows>(path);
    if (res) {
      this.tableRows$.next(res.rows);
      console.log('table rows loaded', res.rows);
    }
  }

  private async createTable(schema: ITableSchema) {
    const appId = this.appId$.value;
    const { tableId } = schema;
    const path = `${appId}/tables/${tableId}`;
    return this.put(path, schema);
  }

  private alterRows(table: ITableMeta | ITableSchema, RowList: rows) {
    const appId = this.appId$.value;
    const { tableId, schemaETag } = table;
    const path = `${appId}/tables/${tableId}/ref/${schemaETag}/rows`;
    return this.put(path, RowList);
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
  private handleErr(error) {
    // TODO - add error handler/notification (or leave to logger interceptor)
    console.error(error);
    throw new Error(error.message);
    return null;
  }
}

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
  rows: ITableRow[];
  tableUri: string;
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
// simple type mapping to keep fidelity with sync endpoint
type rows = ITableRow[];
