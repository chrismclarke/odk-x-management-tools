import * as IODK from '../../types/odk.types';
import http from './http';

/**
 * Common methods for interacting with ODK rest
 * NOTE - should be kept in sync odkxm project
 */
class OdkRestApi {
  public appId = '';
  constructor() {}

  /********************************************************
   * Implementation of specific ODK Rest Functions
   * https://docs.odk-x.org/odk-2-sync-protocol/
   *********************************************************/
  getAppNames() {
    const path = '';
    return http.get<string[]>(path);
  }

  getPriviledgesInfo() {
    const path = `${this.appId}/privilegesInfo`;
    return http.get<IODK.IResUserPriviledge>(path);
  }
  getTables() {
    const path = `${this.appId}/tables`;
    return http.get<IODK.IResTables>(path);
  }
  getDefinition(tableId: string, schemaETag: string) {
    const path = `${this.appId}/tables/${tableId}/ref/${schemaETag}`;
    return http.get<IODK.IResSchema>(path);
  }
  getRows(tableId: string, schemaETag: string, params = {}) {
    const path = `${this.appId}/tables/${tableId}/ref/${schemaETag}/rows`;
    return http.get<IODK.IResTableRows>(path, { params });
  }

  createTable(schema: IODK.ITableSchema) {
    const { tableId } = schema;
    const path = `${this.appId}/tables/${tableId}`;
    return http.put<IODK.IResTableCreate>(path, schema);
  }

  alterRows(tableId: string, schemaETag: string, rows: IODK.IUploadRowList) {
    const path = `${this.appId}/tables/${tableId}/ref/${schemaETag}/rows`;
    return http.put<IODK.IResAlterRows>(path, rows);
  }

  deleteTable(tableId: string, schemaETag: string) {
    const path = `${this.appId}/tables/${tableId}/ref/${schemaETag}`;
    return http.del(path);
  }

  getAppLevelFileManifest(odkClientVersion = 2) {
    const path = `default/manifest/${odkClientVersion}`;
    return http.get<{ files: IODK.IManifestItem[] }>(path);
  }

  getFile(filepath: string, odkClientVersion = 2) {
    const path = `default/files/${odkClientVersion}/${filepath}?as_attachment=false`;
    return http.get<Buffer>(path, { responseType: 'arraybuffer' });
  }

  getTableIdFileManifest(tableId: string, odkClientVersion = 2) {
    const path = `default/manifest/${odkClientVersion}/${tableId}`;
    return http.get<{ files: IODK.IManifestItem[] }>(path);
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
    return http.post(
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
    return http.del(`${this.appId}/files/${odkClientVersion}/${filePath}`);
  }
}
export default OdkRestApi;
