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
  schemaETag: string;
  tableId: string;
}
// Schema columns are used when defining database data structures
interface ISchemaColumn {
  elementKey: string;
  elementName: string;
  elementType: string;
  listChildElementKeys: string;
}

export interface ITableRow {
  _default_access: AccessLevel;
  _row_owner: string;
  _group_read_only: BoolString;
  _group_modify: BoolString;
  _group_privileged: BoolString;
  _form_id: string;
  _id: string;
  _locale: string;
  _row_etag: string;
  _savepoint_creator: string;
  _savepoint_timestamp: ISOString;
  _savepoint_type: Savepoint;
}

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
