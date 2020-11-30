import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as IODK from '../../types/odk.types';
import OdkRestService from './odk.rest';
import { NotificationService } from '../notification.service';
import * as ODKUtils from './odk.utils';
import { arrayToHashmap } from '../../utils/utils';

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
  private odkRest: OdkRestService;
  constructor(private notifications: NotificationService) {
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
    this.odkRest = new OdkRestService((err) => {
      this.notifications.showMessage(`${err.message} \r\n See console for more info`, 'error');
    });
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
    const appIds = await this.odkRest.getAppNames();
    if (appIds[0]) {
      console.log('appIds', appIds);
      this.setActiveAppId(appIds[0]);
      this.allAppIds$.next(appIds);
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
    console.log('set active app id', appId);
    this.odkRest.appId = appId;
    console.log('odk rest app id', this.odkRest.appId);
    this.userPriviledges$.next(undefined);
    this.appId$.next(appId);
    const userPriviledges = await this.odkRest.getPriviledgesInfo();
    if (userPriviledges) {
      this.userPriviledges$.next(userPriviledges);
    }
    this.getAllTables();
  }
  /**
   * Remove existing table meta and retrieve specified table rows and schema
   */
  async setActiveTable(table: IODK.ITableMeta | undefined) {
    console.log('setting active table', table);
    this.table$.next(table);
    this.tableRows$.next(undefined);
    if (table) {
      const { tableId, schemaETag } = table;
      const { schema, tableRows } = await this.getTableMeta(tableId, schemaETag);
      this.tableSchema$.next(schema);
      this.tableRows$.next(tableRows);
    }
  }

  /**
   * Get the table definition any any rows
   * from the server (or cache if available) and populate to their corresponding
   * behaviour subjects and cache
   */
  async getTableMeta(tableId: string, schemaETag: string, skipCache = false) {
    if (this._cache[tableId] && !skipCache) {
      return this._cache[tableId];
    } else {
      // TODO - handle in parallel?
      const schema = await this.odkRest.getDefinition(tableId, schemaETag);
      const { rows } = await this.getRowsInBatch(tableId, schemaETag);
      const resRows = rows;
      const tableRows = ODKUtils.convertODKRowsForExport(rows);
      this._cache[tableId] = { schema, tableRows, resRows };
      return this._cache[tableId];
    }
  }
  /**
   * Use paged queries to get all rows and avoid timeout/size issues
   */
  async getRowsInBatch(
    tableId: string,
    schemaETag: string,
    allRows = [],
    cursor = null
  ): Promise<IODK.IResTableRows> {
    const params: any = { fetchLimit: this.fetchLimit };
    if (cursor) {
      params.cursor = cursor;
    }
    const res = await this.odkRest.getRows(tableId, schemaETag, params);
    const { hasMoreResults, webSafeResumeCursor, rows } = res;
    allRows = [...allRows, ...rows];
    if (hasMoreResults) {
      return this.getRowsInBatch(tableId, schemaETag, allRows, webSafeResumeCursor);
    }
    return { ...res, rows: allRows };
  }

  /**
   * Retrieve json used to define a formdef survey for a given tableId and formId
   * @param formId - specific form to use, default will use the tableId
   */
  async getFormdef(tableId: string, formId?: string) {
    formId = formId || tableId;
    const cachePath = `${tableId}/${formId}/formDef.json`;
    if (this._cache[cachePath]) {
      return this._cache[cachePath];
    }
    const formDefPath = `tables/${tableId}/forms/${formId}/formDef.json`;
    const formDef = await this.odkRest.getFile(formDefPath, 2, 'json');
    this._cache[cachePath] = formDef;
    return this.getFormdef(tableId, formId);
  }

  /**
   * When updating rows first
   * TODO - copy/sync back with cwbc-odkx-app
   */
  async updateRows(tableRows: IODK.ITableRow[]) {
    const { tableId, schemaETag, dataETag } = this.table$.value;
    // fetch fresh schema in case planning multiple updates in a row
    const schema = await this.odkRest.getDefinition(tableId, schemaETag);
    const { orderedColumns } = schema;
    // Refactor updates to match upload format
    const rows = ODKUtils.convertODKRowsForUpload(tableRows, orderedColumns);
    // run update
    const res = await this.odkRest.alterRows(tableId, schemaETag, { rows, dataETag });
    // process any new table and row etags
    const rawRowUpdatesById = arrayToHashmap(tableRows, '_id');
    const resRowUpdatesById = arrayToHashmap(
      res.rows.filter((r) => r.outcome === 'SUCCESS'),
      'id'
    );
    // update local definitions with new etags returned from update operations
    this.table$.next({ ...this.table$.value, dataETag: res.dataETag });
    this.tableRows$.next(
      this.tableRows$.value.map((r) => {
        const update = resRowUpdatesById[r._id];
        if (update) {
          return {
            ...rawRowUpdatesById[r._id],
            _row_etag: update.rowETag,
            _data_etag_at_modification: res.dataETag,
          };
        }
        return r;
      })
    );
    return res;
  }

  async deleteCurrentTable() {
    const { tableId, schemaETag } = this.table$.value;
    await this.odkRest.deleteTable(tableId, schemaETag);
    await this.setActiveTable(undefined);
    return this.getAllTables();
  }

  async getAllTableRows() {
    const promises = this.allTables$.value.map(async (table) => {
      const { tableId, schemaETag } = table;
      const res = await this.odkRest.getRows(tableId, schemaETag);
      return { tableId, rows: ODKUtils.convertODKRowsForExport(res.rows) };
    });
    return Promise.all(promises);
  }

  private async getAllTables() {
    this.allTables$.next([]);
    const res = await this.odkRest.getTables();
    if (res) {
      this.allTables$.next(res.tables);
      console.log('tables ids loaded', res.tables);
    }
  }

  /**
   * Create a copy of a table on the server
   * (Not currently in use - could possibly use refinement)
   */
  async backupCurrentTable(backupTableId: string) {
    // const { tableId, schemaETag } = this.table$.value;
    // const schema = await this.odkRest.getDefinition(tableId, schemaETag);
    // const { orderedColumns } = schema;
    // const backupSchema: IODK.ITableSchema = {
    //   schemaETag: `uuid:${UUID().toString()}`,
    //   tableId: backupTableId,
    //   orderedColumns,
    // };
    // const backup = await this.odkRest.createTable(backupSchema);
    // console.log('backup table res', backup);
    // // fetch rows again instead of using converted as easier to modify
    // let { rows } = await this.getRowsInBatch(tableId, schemaETag);
    // rows = rows.map((r) => {
    //   // selfUri property not supported on put request
    //   delete r.selfUri;
    //   r.dataETagAtModification = backup.dataETag;
    //   return r;
    // });
    // const rowList = { rows, dataETag: backup.dataETag };
    // const res = await this.odkRest.alterRows(backup.tableId, backup.schemaETag, rowList);
    // // TODO - handle response related to row outcomes
    // console.log('bakup res', res);
    // await this.getAllTables();
    // await this.setActiveTable(backup);
  }

  /**
   * Clear the cache and reload current table data (following updates)
   * Deprecated 2020-11-29
   */
  // async refreshActiveTable() {
  //   const { tableId, schemaETag } = this.table$.value;
  //   this.tableRows$.next(undefined);
  //   this.tableSchema$.next(undefined);
  //   this._cache[tableId] = undefined;
  //   // refetch table meta
  //   const { schema, tableRows } = await this.getTableMeta({
  //     tableId,
  //     schemaETag,
  //   } as IODK.ITableMeta);
  //   this.tableSchema$.next(schema);
  //   this.tableRows$.next(tableRows);
  // }
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

// /********************************************************
//  * Service-specific interfaces
//  *********************************************************/
interface IQueryCache {
  [tableId: string]: {
    schema: IODK.ITableSchema;
    tableRows: IODK.ITableRow[];
    resRows: IODK.IResTableRow[];
  };
}
