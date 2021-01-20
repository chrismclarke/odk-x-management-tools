import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as IODK from '../../types/odk.types';
import OdkRestService from './odk.rest';
import { NotificationService } from '../notification.service';
import * as ODKUtils from './odk.utils';
import { arrayToHashmap } from '../../utils/utils';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OdkService {
  // observable properties for use in components
  allAppIds$ = new BehaviorSubject<string[]>([]);
  allTables$ = new BehaviorSubject<IODK.ITableMeta[]>([]);
  appId$ = new BehaviorSubject<string>(undefined);
  table$ = new BehaviorSubject<IODK.ITableMeta>(undefined);
  tableRows$ = new BehaviorSubject<IODK.ITableRow[]>(undefined);
  tableSchema$ = new BehaviorSubject<IODK.ITableSchema>(undefined);
  userPriviledges$ = new BehaviorSubject<IODK.IUserPriviledge>(undefined);
  isConnected = new BehaviorSubject<boolean>(false);

  /** Limit the maximum number of rows returned from requests (e.g. to prevent timeout depending on server limits) */
  fetchLimit = localStorage.getItem('fetchLimit') || environment.useApiProxy ? '50' : '5000';
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
  private async init() {
    this.serverUrl = null;

    this.odkRest = new OdkRestService((err) => {
      const friendlyMessage = this._getFriendlyErrorMessage(err);
      this.notifications.showMessage(friendlyMessage, 'error');
    });
  }
  /**
   * when disconnecting want to re-initialise behaviour observer values without
   * removing existing subscriptions
   */
  private resetValues() {
    this.allAppIds$.next([]);
    this.allTables$.next([]);
    this.appId$.next(undefined);
    this.table$.next(undefined);
    this.tableRows$.next(undefined);
    this.tableSchema$.next(undefined);
    this.userPriviledges$.next(undefined);
    this.isConnected.next(false);
  }
  private _getFriendlyErrorMessage(err: Error | string) {
    let msg = typeof err === 'string' ? err : err.message;
    if (!msg) {
      console.log('no message', err);
    }
    switch (msg) {
      case 'Request failed with status code 403':
        return 'User does not have permission for this operation';
      default:
        // console.log('no friendly message:', msg);
        if (!msg.includes('console')) {
          msg += '\r\n See console for more info';
        }
        return msg;
    }
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
    console.log('connect', appIds);
    if (appIds[0]) {
      console.log('appIds', appIds);
      this.setActiveAppId(appIds[0]);
      this.allAppIds$.next(appIds);
      this.isConnected.next(true);
    }
  }
  disconnect() {
    this.resetValues();
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
      console.log('user priviledges', userPriviledges);
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
   * ODK specifies section labels either within the settings screen or within choice lists
   * Identify which if settings or choice list used and lookup
   * */
  getFormdefSectionLabels(formDef: IODK.IFormDef) {
    const labels = {};
    const sectionNames = formDef.specification.section_names;
    // Check if branches are used in main survey
    // Additionally check for custom CWBC contents page which also functions as a user_branch
    const branch_prompt_names = ['user_branch', 'custom_contents_page'];
    const branch_choice_list = formDef.specification.sections.survey?.prompts.find((p) =>
      branch_prompt_names.includes(p.type)
    )?.values_list;
    for (const sectionName of sectionNames) {
      let choiceLabel: string;
      // retrieve from choice list
      if (branch_choice_list) {
        choiceLabel = formDef.specification.choices[branch_choice_list].find(
          (c) => c.data_value === sectionName
        )?.display?.title?.text;
      }
      // retrieve from settings
      const settingsLabel = formDef.specification.settings[sectionName]?.display?.title?.text;
      // return first of whichever of these values exist
      labels[sectionName] = choiceLabel || settingsLabel || sectionName;
    }
    return labels;
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
