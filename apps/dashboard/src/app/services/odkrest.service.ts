import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAPIResponse } from '@odkxm/api-interfaces';
import { BehaviorSubject } from 'rxjs';
import { ITableMeta, IUserPriviledge, ITableRow } from '../types/odk.types';

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

  /**
   *  On initial connect, attempt to load list of apps
   *  and set current app as default.
   *  @returns - boolean depending on connection success
   */
  async connect() {
    const appIds = await this.get<string[] | null>('');
    if (appIds) {
      this.allAppIds$.next(appIds);
      this.setAppId(appIds[0]);
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
  setAppId(appId: string) {
    this.appId$.next(appId);
    this.getPriviledgesInfo();
    this.loadTables();
    console.log('app id set', appId);
  }
  setTable(table: ITableMeta) {
    console.log('setting table', table);
    this.table$.next(table);
    this.loadTableRows();
    console.log('table set', table);
  }

  private async getPriviledgesInfo() {
    this.userPriviledges$.next(undefined);
    const appId = this.appId$.value;
    const url = `${appId}/privilegesInfo`;
    const userPriviledges = await this.get<IResUserPriviledge>(url);
    console.log('user priviledges', userPriviledges);
    if (userPriviledges) {
      this.userPriviledges$.next(userPriviledges);
    }
  }

  private async loadTables() {
    this.allTables$.next([]);
    const appId = this.appId$.value;
    const url = `${appId}/tables`;
    const res = await this.get<IResTables>(url);
    if (res) {
      this.allTables$.next(res.tables);
      console.log('tables ids loaded', res.tables);
    }
  }

  private async loadTableRows() {
    this.tableRows$.next([]);
    const appId = this.appId$.value;
    const { tableId, schemaETag } = this.table$.value;
    const url = `${appId}/tables/${tableId}/ref/${schemaETag}/rows`;
    const res = await this.get<IResTableRows>(url);
    if (res) {
      this.tableRows$.next(res.rows);
      console.log('table rows loaded', res.rows);
    }
  }

  /**
   * Simple wrapper around requests to the odk tables api which will be proxied
   * via the local server api
   * @param endpoint: See full list at https://docs.odk-x.org/odk-2-sync-protocol/
   * @returns - Promise that will always resolve (null on error)
   */
  private get<ResponseDataType = any>(
    endpoint: string
  ): Promise<ResponseDataType> {
    return new Promise(resolve => {
      this.http
        .get<IAPIResponse>(`/odktables/${endpoint}`)
        .toPromise()
        .then(res => {
          resolve(res.data as ResponseDataType);
        })
        .catch(_ => {
          // TODO - add error handler/notification (or leave to logger interceptor)
          resolve(null);
        });
    });
  }
}

/**
 * Rest API Interfaces
 */
interface IResTables {
  appLevelManifestETag: string;
  tables: ITableMeta[];
}
interface IResTableRows extends IResBase {
  dataETag: 'uuid:dba50e7b-dd57-4309-a93a-ac77ff154d40';
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
type IResUserPriviledge = IUserPriviledge;
