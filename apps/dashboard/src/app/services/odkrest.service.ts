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
      this.tableRows$.next(rows);
    }
  }
  async backupCurrentTable() {
    const appId = this.appId$.value;
    const { tableId, schemaETag } = this.table$.value;
    const schema = await this.getDefinition(appId, tableId, schemaETag);
    const { orderedColumns } = schema;
    // store epoch timestamp as suffix
    const suffix = new Date().getTime();
    const backupSchema: ITableSchema = {
      schemaETag: `uuid:${UUID().toString()}`,
      tableId: `${tableId}_${suffix}`,
      orderedColumns
    };
    const backup = await this.createTable(backupSchema);
    console.log('backup table res', backup);
    const rows = this.tableRows$.value.map(r => {
      // note - selfUris aren't recognised and should be removed
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
    // TODO - fix ngmodel bindings in app-table-select to allow
    // direct loading of this table as active
    await this.setActiveTable(backup);
  }
  async deleteCurrentTable() {
    const appId = this.appId$.value;
    const { tableId, schemaETag } = this.table$.value;
    await this.deleteTable(appId, tableId, schemaETag);
    await this.setActiveTable(undefined);
    return this.getTables();
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
  rows: ITableRow[];
  dataETag: string;
}
