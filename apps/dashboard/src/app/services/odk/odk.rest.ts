import * as IODK from '../../types/odk.types';
import { AxiosHttpService, IErrorHandler } from './http';
import {ResponseType} from 'axios'

/**
 * Common methods for interacting with ODK rest
 * NOTE - should be kept in sync odkxm project
 */
class OdkRestApi {
  public appId = '';
  http: AxiosHttpService;
  constructor(errorHandler: IErrorHandler) {
    this.http = new AxiosHttpService(errorHandler);
  }

  /********************************************************
   * Implementation of specific ODK Rest Functions
   * https://docs.odk-x.org/odk-2-sync-protocol/
   *********************************************************/
  getAppNames() {
    const path = '';
    return this.http.get<string[]>(path);
  }

  getPriviledgesInfo() {
    const path = `${this.appId}/privilegesInfo`;
    return this.http.get<IODK.IResUserPriviledge>(path);
  }
  getTables() {
    const path = `${this.appId}/tables`;
    return this.http.get<IODK.IResTables>(path);
  }
  getDefinition(tableId: string, schemaETag: string) {
    const path = `${this.appId}/tables/${tableId}/ref/${schemaETag}`;
    return this.http.get<IODK.IResSchema>(path);
  }
  getRows(tableId: string, schemaETag: string, params = {}) {
    const path = `${this.appId}/tables/${tableId}/ref/${schemaETag}/rows`;
    return this.http.get<IODK.IResTableRows>(path, { params });
  }

  createTable(schema: IODK.ITableSchema) {
    const { tableId } = schema;
    const path = `${this.appId}/tables/${tableId}`;
    return this.http.put<IODK.IResTableCreate>(path, schema);
  }

  alterRows(tableId: string, schemaETag: string, rows: IODK.IUploadRowList) {
    const path = `${this.appId}/tables/${tableId}/ref/${schemaETag}/rows`;
    return this.http.put<IODK.IResAlterRows>(path, rows);
  }

  deleteTable(tableId: string, schemaETag: string) {
    const path = `${this.appId}/tables/${tableId}/ref/${schemaETag}`;
    return this.http.del(path);
  }

  getAppLevelFileManifest(odkClientVersion = 2) {
    const path = `default/manifest/${odkClientVersion}`;
    return this.http.get<{ files: IODK.IManifestItem[] }>(path);
  }

  getFile(filepath: string, odkClientVersion = 2, responseType: ResponseType = 'arraybuffer') {
    const path = `default/files/${odkClientVersion}/${filepath}?as_attachment=false`;
    return this.http.get<Buffer  | any>(path, { responseType });
  }

  getTableIdFileManifest(tableId: string, odkClientVersion = 2) {
    const path = `default/manifest/${odkClientVersion}/${tableId}`;
    return this.http.get<{ files: IODK.IManifestItem[] }>(path);
  }

  /**
   * Upload App-Level File
   * @param filepath - relative path on server, e.g. tables/exampleTable/definition.csv
   */
  putFile(
    filePath: string,
    fileData: Buffer,
    contentType: string,
    odkClientVersion = 2
  ) {
    // app files and table files have different endpoints
    return this.http.post(
      `${this.appId}/files/${odkClientVersion}/${filePath}`,
      fileData,
      {
        'content-type': contentType + '; charset=utf-8',
        accept: contentType,
        'accept-charset': 'utf-8',
      }
    );
  }
  deleteFile(filePath: string, odkClientVersion = 2) {
    return this.http.del(`${this.appId}/files/${odkClientVersion}/${filePath}`);
  }
}
export default OdkRestApi;
