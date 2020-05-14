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
export interface ITableRow {
  createUser: string;
  dataETagAtModification: string;
  deleted: false;
  filterScope: {
    defaultAccess: AccessLevel;
    rowOwner: string;
    groupReadOnly: BoolString;
    groupModify: BoolString;
    groupPrivileged: BoolString;
  };
  formId: string;
  id: string;
  lastUpdateUser: string;
  locale: string;
  orderedColumns: ITableColumn[];
  rowETag: string;
  savepointCreator: string;
  savepointTimestamp: ISOString;
  savepointType: Savepoint;
  selfUri: string;
}
interface ITableColumn {
  column: string;
  value: any;
}

export interface IUserPriviledge {
  defaultGroup: Priviledge;
  full_name: string;
  roles: Priviledge[];
  user_id: string;
}

type BoolString = 'TRUE' | 'FALSE';

// just a reminder type that dates are stored in the format
type ISOString = string;

// TODO - lists not exhaustive
type AccessLevel = 'FULL';
type Savepoint = 'COMPLETE';
type Priviledge =
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
