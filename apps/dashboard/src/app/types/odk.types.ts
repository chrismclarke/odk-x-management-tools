// CC NOTE - this file should be ideally be kept in sync with cwbc project
export interface ITableMeta {
  aclUri: string;
  dataETag: string;
  dataUri: string;
  definitionUri: string;
  diffUri: string;
  instanceFilesUri: string;
  schemaETag: string;
  selfUri: string;
  tableId: string;
  tableLevelManifestETag: string;
}
export interface ITableSchema {
  orderedColumns: ISchemaColumn[];
  schemaETag?: string;
  tableId: string;
}
// Schema columns are used when defining database data structures
export interface ISchemaColumn {
  elementKey: string;
  elementName: string;
  elementType: string;
  listChildElementKeys: string;
}

export interface ITableRow {
  _deleted: boolean;
  _data_etag_at_modification: string;
  _default_access: AccessLevel;
  _form_id: string;
  _group_modify: BoolString;
  _group_privileged: BoolString;
  _group_read_only: BoolString;
  _id: string;
  _locale: string;
  _row_etag: string;
  _row_owner: string;
  _savepoint_creator: string;
  _savepoint_timestamp: ISOString;
  _savepoint_type: Savepoint;
}

// CSV table data follows specific format for fields before and after form key:value pairs
export interface ICSVTableRow {
  _id: string;
  _form_id: string;
  _locale: string;
  _savepoint_type: Savepoint;
  _savepoint_timestamp: string;
  _savepoint_creator: string;
  _deleted: BoolString;
  _data_etag_at_modification: string;
  [FORM_KEY: string]: string;
  _default_access: AccessLevel;
  _group_modify: BoolString;
  _group_privileged: BoolString;
  _group_read_only: BoolString;
  _row_etag: string;
  _row_owner: string;
}
// Formate required when pushing rows to upload via rest api
export interface IUploadTableRow {
  rowETag: string;
  deleted: boolean;
  formId: string;
  locale: string;
  savepointType: Savepoint;
  savepointTimestamp: ISOString;
  savepointCreator: string;
  orderedColumns: IResTableColumn[];
  id: string;
  filterScope: {
    defaultAccess: AccessLevel;
    rowOwner: string;
    groupReadOnly: BoolString;
    groupModify: BoolString;
    groupPrivileged: BoolString;
  };
}
export interface IResTableRow extends IUploadTableRow {
  createUser: string;
  dataETagAtModification: string;
  lastUpdateUser: string;
  selfUri: string;
}

export type ITableMetaColumnKey = keyof ITableRow;

export interface IUserPriviledge {
  defaultGroup: Priviledge;
  full_name: string;
  roles: Priviledge[];
  user_id: string;
}

export type BoolString = 'TRUE' | 'FALSE';

// just a reminder type that dates are stored in the format
export type ISOString = string;

// TODO - lists not exhaustive
export type AccessLevel = 'FULL';
export type Savepoint = 'COMPLETE';
export type Priviledge =
  | 'ROLE_SITE_ACCESS_ADMIN'
  | 'AUTH_LDAP'
  | 'ROLE_ADMINISTER_TABLES'
  | 'ROLE_DATA_COLLECTOR'
  | 'ROLE_DATA_OWNER'
  | 'ROLE_DATA_VIEWER'
  | 'ROLE_SITE_ACCESS_ADMIN'
  | 'ROLE_SUPER_USER_TABLES'
  | 'ROLE_SYNCHRONIZE_TABLES'
  | 'ROLE_USER'
  | 'USER_IS_REGISTERED';

export interface IManifestItem {
  filename: string;
  contentLength: number;
  contentType: string;
  md5hash: string;
  downloadUrl: string;
}

export interface IResTables extends IResBase {
  appLevelManifestETag: string;
  tables: ITableMeta[];
}
export interface IResTableRows extends IResBase {
  dataETag: string;
  rows: IResTableRow[];
  tableUri: string;
}

export interface IResTableColumn {
  column: string;
  value: any;
}
export interface IResAlterRows {
  dataETag: string;
  rows: ITableRowAltered[];
  tableUri: string;
}
interface ITableRowAltered extends ITableRow {
  outcome: 'UNKNOWN' | 'SUCCESS' | 'DENIED' | 'IN_CONFLICT' | 'FAILED';
}
export interface IResTableCreate {
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
export interface IResBase {
  hasMoreResults: boolean;
  hasPriorResults: boolean;
  webSafeBackwardCursor: string;
  webSafeRefetchCursor: null;
  webSafeResumeCursor: string;
}
export interface IResSchema extends ITableSchema {
  selfUri: string;
  tableUri: string;
}

export type IResUserPriviledge = IUserPriviledge;
export interface IUploadRowList {
  rows: IUploadTableRow[];
  dataETag: string;
}
