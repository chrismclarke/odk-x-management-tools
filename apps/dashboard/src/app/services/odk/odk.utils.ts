import * as IODK from '../../types/odk.types';
import { objectFilter } from '../../utils/utils';

/********************************************************
 * ODK Helper functions
 *********************************************************/

/**
 * By default ODK rest returns rows with metadata and values defined in
 * a different format to how it is shown and exported in app
 * - Convert metadata fields to snake_case and prefix with underscore,
 * - De-nest filterScope and add to metadata prefixed with _group
 * - De-nest orderedColumns and extract to variable values
 * - Delete various fields
 * - Match metafield order as specified in SyncClient.java
 */
export function convertODKRowsForExport(rows: IODK.IResTableRow[]): IODK.ITableRow[] {
  const converted = [];
  rows.forEach((row) => {
    const r = { ...row };
    const data: any = {};
    // create mapping for all fields as snake case, and un-nest filtersocpe fields
    const { filterScope } = r;
    Object.entries(filterScope).forEach(([key, value]) => {
      r[`_${camelToSnake(key)}`] = value;
    });
    Object.entries(r).forEach(([key, value]) => {
      r[`_${camelToSnake(key)}`] = value;
    });
    const metadataColumns1: IODK.ITableMetaColumnKey[] = [
      '_id',
      '_form_id',
      '_locale',
      '_savepoint_type',
      '_savepoint_timestamp',
      '_savepoint_creator',
      '_deleted',
      '_data_etag_at_modification',
    ];
    // some metadata columns go to front
    metadataColumns1.forEach((col) => (data[col] = r[col]));
    // main data in centre
    r.orderedColumns.forEach((el) => {
      const { column, value } = el;
      data[column] = value;
    });
    const metadataColumns2: IODK.ITableMetaColumnKey[] = [
      '_default_access',
      '_group_modify',
      '_group_privileged',
      '_group_read_only',
      '_row_etag',
      '_row_owner',
    ];
    // other metadata columns go to back
    metadataColumns2.forEach((col) => (data[col] = r[col]));
    converted.push(data);
  });
  return converted;
}

/**
 * Convert odk row array back into the format required when running alter operations
 */
export function convertODKRowsForUpload(
  rows: IODK.ITableRow[],
  orderedColumns: IODK.ISchemaColumn[]
): IODK.IUploadTableRow[] {
  const uploadRows = rows.map((r) => {
    // map column metadata to upload format
    const uploadColumns = orderedColumns.map((c) => {
      const uploadColumn: IODK.IResTableColumn = { column: c.elementKey, value: r[c.elementKey] };
      return uploadColumn;
    });
    const uploadRow: IODK.IUploadTableRow = {
      orderedColumns: uploadColumns,
      filterScope: {
        defaultAccess: r._default_access,
        groupModify: r._group_modify,
        groupPrivileged: r._group_privileged,
        groupReadOnly: r._group_read_only,
        rowOwner: r._row_owner,
      },
      deleted: r._deleted,
      formId: r._form_id,
      id: r._id,
      locale: r._locale,
      rowETag: r._row_etag,
      savepointCreator: r._savepoint_creator,
      savepointTimestamp: r._savepoint_timestamp,
      savepointType: r._savepoint_type,
    };
    return uploadRow;
  });

  return uploadRows;
}

/**
 * Takes an odk form defintion and returns a list of all data fields
 * identified from the survey alongside their corresponding formdef row data
 */
export function extractFormdefPromptsByName(formdef: IODK.IFormDef) {
  const { xlsx } = formdef;
  const surveySections = [xlsx.survey];
  // build complete list of branches
  for (const row of xlsx.survey) {
    if (row.branch_label && xlsx.hasOwnProperty(row.branch_label)) {
      surveySections.push(xlsx[row.branch_label]);
    }
  }
  // create hashmap of all prompts by name
  const promptsByName: { [name: string]: IODK.ISurveyWorksheetRow } = {};
  surveySections.forEach((rows) => {
    rows.forEach((row) => {
      if (row.name) {
        promptsByName[row.name] = row;
      }
    });
  });
  return promptsByName;
}

export function extractChoicesByName(formdef: IODK.IFormDef) {
  const {} = formdef;
}

/**
 * Generate a UUID in standard format for ODK
 * e.g. uuid:c509cba4-35b4-47ff-b9a3-d52abeb76317
 */
export function generateUUID(): string {
  return `uuid:${uuidv4()}`;
}

/********************************************************
 * General Helper functions
 *********************************************************/
/**
 * String convert util
 * @example rowETag -> row_etag
 */
export function camelToSnake(str: string) {
  return str
    .replace(/[\w]([A-Z])/g, function (m) {
      return m[0] + '_' + m[1];
    })
    .toLowerCase();
}

// Simple implementation of UUIDv4
// tslint:disable no-bitwise
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
