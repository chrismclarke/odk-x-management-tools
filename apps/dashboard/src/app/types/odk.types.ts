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
/**
 * Priviledges are used to associate users to specific groups and roles

| Code | Group              | Role                    |
| ---- | ------------------ | ----------------------- |
| 500  | site_admins        | ROLE_SITE_ACCESS_ADMIN  |
| 501  | administer_tables  | ROLE_ADMINISTER_TABLES  |
| 502  | super_user_tables  | ROLE_SUPER_USER_TABLES  |
| 503  | synchronize_tables | ROLE_SYNCHRONIZE_TABLES |
| 504  | form_managers      |
| 505  | data_viewers       | ROLE_DATA_VIEWER        |
| 506  | data_collectors    | ROLE_DATA_COLLECTOR     |

 */
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
interface ITableRowAltered {
  outcome: 'UNKNOWN' | 'SUCCESS' | 'DENIED' | 'IN_CONFLICT' | 'FAILED';
  // TODO - Tidy typings and copy to other projects (CC-2020-11-29)
  createUser: null;
  dataETagAtModification: string;
  deleted: false;
  filterScope: {
    defaultAccess: 'FULL';
    rowOwner: null;
    groupReadOnly: null;
    groupModify: null;
    groupPrivileged: null;
  };
  formId: null;
  id: string;
  lastUpdateUser: null;
  locale: null;
  orderedColumns: null;
  rowETag: string;
  savepointCreator: null;
  savepointTimestamp: null;
  savepointType: null;
  selfUri: null;
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

/********************************************************************
 * Copied from cwbc-odkx-app survey-parser
 ********************************************************************/
export interface IFormDef {
  xlsx: IFormDefWorksheets;
  specification: IFormDefSpecification;
}

// https://docs.odk-x.org/xlsx-converter-reference/#excel-worksheets
interface IFormDefWorksheets {
  // mandatory worksheets
  survey: ISurveyWorksheetRow[];
  settings: any;
  // optional worksheets
  properties?: any;
  calculates?: any;
  choices?: any;
  model?: any;
  queries?: any;
  column_types?: any;
  prompt_types?: any;
  framework_translations?: any;
  common_translations?: any;
  table_specific_translations?: any;
  // additional worksheets can be referenced by name
  [userDefinedSection: string]: ISurveyWorksheetRow[];
}

export interface ISurveyWorksheetRow {
  // populated metadata
  _row_num: number;
  // core inputs, compulsory on form but might be removed from formDef
  type?: string;
  name?: string;
  display?: {
    prompt?:
      | string
      | {
          text?: string;
          audio?: string;
          image?: string;
          video?: string;
        };
    title?: ITranslatableText;
    constraint_message?: ITranslatableText;
    hint?: ITranslatableText;
  };
  // additional inputs
  branch_label?: string;
  calculation?: string;
  choice_filter?: string;
  clause?: string;
  comments?: string;
  condition?: string;
  constraint?: string;
  default?: string;
  hideInContents?: string;
  inputAttributes?: {
    [attribute: string]: string;
  };
  isSessionVariable?: string;
  required?: string;
  templatePath?: string;
  values_list?: string;
  // not included in docs but still exists
  screen?: {
    screen_type?: string;
  };
}

export interface ISurveyRowWithValue extends ISurveyWorksheetRow {
  value: string;
  select_options?: { label: string; value: string }[];
}
type ISurveyRowKey = keyof ISurveyWorksheetRow;
// translations can be provided by a reference or direct text
type ITranslatableText = 'string' | { text: string };

interface IFormDefSpecification {
  calculates: any;
  choices: {
    [choice_list_name: string]: IFormDefSpecificationChoice[];
  };
  column_types: any;
  common_definitions: any;
  dataTableModel: any;
  framework_definitions: any;
  model: any;
  properties: any[];
  queries: any;
  section_names: string[];
  sections: { [section_name: string]: IFormSection };
  settings: any;
}
export interface IFormDefSpecificationChoice {
  choice_list_name: string;
  data_value: string;
  display: { title: { text: string } };
  _row_num: number;
}

export interface IFormSection {
  branch_label_map: any;
  nested_sections: { [section_name: string]: boolean };
  operations: any[];
  prompts: ISurveyWorksheetRow[];
  reachable_sections: { [section_name: string]: boolean };
  section_name: string;
  validation_tag_map: any;
}
