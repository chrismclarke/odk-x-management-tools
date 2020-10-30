import { Injectable } from '@angular/core';
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
    this.odkRest = new OdkRestService();
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
      const { schema, tableRows } = await this.getTableMeta(table);
      this.tableSchema$.next(schema);
      this.tableRows$.next(tableRows);
    }
  }
  /**
   * Clear the cache and reload current table data (following updates)
   */
  async refreshActiveTable() {
    this.tableRows$.next(undefined);
    this._cache[this.table$.value.tableId] = undefined;
    this.setActiveTable(this.table$.value);
  }
  /**
   * Get the table definition any any rows
   * from the server (or cache if available) and populate to their corresponding
   * behaviour subjects and cache
   */
  async getTableMeta(table: IODK.ITableMeta) {
    const { tableId, schemaETag } = table;
    if (this._cache[tableId]) {
      return this._cache[tableId];
    } else {
      // TODO - handle in parallel?
      const schema = await this.odkRest.getDefinition(tableId, schemaETag);
      const { rows } = await this.getRowsInBatch(table);
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
    table: IODK.ITableMeta,
    allRows = [],
    cursor = null
  ): Promise<IODK.IResTableRows> {
    const { tableId, schemaETag } = table;
    const params: any = { fetchLimit: this.fetchLimit };
    if (cursor) {
      params.cursor = cursor;
    }
    const res = await this.odkRest.getRows(tableId, schemaETag, params);
    const { hasMoreResults, webSafeResumeCursor, rows } = res;
    allRows = [...allRows, ...rows];
    if (hasMoreResults) {
      return this.getRowsInBatch(table, allRows, webSafeResumeCursor);
    }
    return { ...res, rows: allRows };
  }
  async updateRows(tableRows: IODK.ITableRow[]) {
    const { tableId, schemaETag, dataETag } = this.table$.value;
    const { resRows } = await this.getTableMeta(this.table$.value);
    // prepare metadata for popluation with upload object
    const rawRowsById: { [id: string]: IODK.IUploadTableRow } = {};
    resRows.forEach((r) => {
      delete r.selfUri;
      rawRowsById[r.id] = r;
    });
    const rowUpdates: IODK.IUploadTableRow[] = [];
    // convert data into correct format for upload
    tableRows.forEach((r) => {
      const rowMeta = rawRowsById[r._id];
      const orderedColumns: IODK.IResTableColumn[] = [];
      Object.entries(r).forEach(([column, value]) => {
        if (column.charAt(0) !== '_') {
          orderedColumns.push({ column, value });
        }
      });
      rowUpdates.push({ ...rowMeta, orderedColumns });
    });
    return this.odkRest.alterRows(tableId, schemaETag, {
      rows: rowUpdates,
      dataETag,
    });
  }
  async backupCurrentTable(backupTableId: string) {
    const { tableId, schemaETag } = this.table$.value;
    const schema = await this.odkRest.getDefinition(tableId, schemaETag);
    const { orderedColumns } = schema;
    const backupSchema: IODK.ITableSchema = {
      schemaETag: `uuid:${UUID().toString()}`,
      tableId: backupTableId,
      orderedColumns,
    };
    const backup = await this.odkRest.createTable(backupSchema);
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
    const res = await this.odkRest.alterRows(
      backup.tableId,
      backup.schemaETag,
      rowList
    );
    // TODO - handle response related to row outcomes
    console.log('bakup res', res);
    await this.getAllTables();
    await this.setActiveTable(backup);
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
