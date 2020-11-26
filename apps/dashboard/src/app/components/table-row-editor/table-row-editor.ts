import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OdkService } from '../../services/odk';
import { extractFormdefPromptsByName } from '../../services/odk/odk.utils';
import {
  IFormDef,
  ISurveyWorksheetRow,
  ITableMeta,
  ITableRow,
  ITableSchema,
} from '../../types/odk.types';
/**
 *
 * TODO
 * - what to do about 'assign' types and calculated values following changes?
 * - what to do about conditional displays?
 */
@Component({
  selector: 'odkxm-table-row-editor',
  styleUrls: ['./table-row-editor.scss'],
  templateUrl: './table-row-editor.html',
})
export class TableRowEditorDialogComponent implements OnInit {
  loading = true;
  fields: ISurveyRowWithValue[];
  formGroup: FormGroup;
  constructor(
    private odkService: OdkService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TableRowEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ITableRowEditorData
  ) {}

  cancel() {
    this.dialogRef.close();
  }
  saveEdits() {}

  ngOnInit() {
    console.log('table row editor', this.data);
    this.prepareQuestions();
  }
  /**
   * Load the formdef for the current data row and extract all questions,
   * labels and select options
   */
  async prepareQuestions() {
    const { table, row } = this.data;
    const { tableId } = table;
    const formdef: IFormDef = await this.odkService.getFormdef(tableId);
    const promptsByName = extractFormdefPromptsByName(formdef);
    const fields: ISurveyRowWithValue[] = [];
    // create field placeholders for all survey rows that have a name,
    // corresponding prompt entry and survey prompt type
    Object.entries(row).forEach(([name, value]) => {
      if (name && promptsByName.hasOwnProperty(name)) {
        if (promptsByName[name].hasOwnProperty('type')) {
          const field: ISurveyRowWithValue = {
            ...promptsByName[name],
            name,
            value,
          };
          // populate choice values where requierd
          if (field.hasOwnProperty('values_list')) {
            field.select_options = formdef.specification.choices[field.values_list].map((v) => ({
              value: v.data_value,
              label: v.display.title.text,
            }));
          }
          fields.push(field);
        }
      }
    });
    this.fields = fields;
    const fieldsHashmap = arrayToHashmap(fields, 'name');
    console.log('fields hashmap', fieldsHashmap);
    this.formGroup = this.fb.group(fieldsHashmap);
    this.loading = false;
  }
}

/**
 * Convert an object array into a json object, with keys corresponding to array entries
 * @param keyfield any unique field which all array objects contain to use as hash keys (e.g. 'id')
 */
function arrayToHashmap<T>(arr: T[], keyfield: string) {
  const hashmap: { [key: string]: T } = {};
  for (const el of arr) {
    if (el.hasOwnProperty(keyfield)) {
      hashmap[el[keyfield]] = el;
    }
  }
  return hashmap;
}

interface ISurveyRowWithValue extends ISurveyWorksheetRow {
  value: string;
  select_options?: any[];
}
export interface ITableRowEditorData {
  row: ITableRow;
  table: ITableMeta;
  schema: ITableSchema;
}
