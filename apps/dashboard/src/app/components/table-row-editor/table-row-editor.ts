import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
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
export class TableRowEditorDialogComponent implements AfterViewInit, OnDestroy {
  isLoading = true;
  isSaving = false;
  initialValues: { [fieldname: string]: string };
  fields: ISurveyRowWithValue[];
  formGroup: FormGroup;
  formChanges$: Subscription;
  /** Keep list of fields that have changed for css styling */
  fieldsChanged: { [name: string]: boolean } = {};
  constructor(
    private odkService: OdkService,
    private notifications: NotificationService,
    public dialogRef: MatDialogRef<TableRowEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ITableRowEditorData
  ) {}

  cancel() {
    this.dialogRef.close();
  }
  async saveEdits() {
    this.isSaving = true;
    const updatedValues = this.formGroup.value;
    const updatedRow = this.data.row;
    // just process entries which have been marked as updated, and apply to original document
    Object.entries(this.fieldsChanged)
      .filter(([_, isChanged]) => isChanged)
      .forEach(([fieldname]) => {
        const updateValue = updatedValues[fieldname];
        updatedRow[fieldname] = updateValue;
      });
    const res = await this.odkService.updateRows([updatedRow]);
    console.log('save response', res);

    // handle response
    if (res.rows[0].outcome === 'SUCCESS') {
      this.notifications.showMessage(`save - ${res.rows[0].outcome}`, 'success', {
        duration: 2000,
      });
      // reset form state
      this.fieldsChanged = {};
      this.initialValues = updatedValues;
      this.formGroup.reset(updatedValues);
    } else {
      // TODO - handle partial success
      this.notifications.showMessage(`save - ${res.rows[0].outcome}`, 'error', { duration: 3500 });
    }
    this.isSaving = false;
  }

  ngAfterViewInit() {
    console.log('table row editor', this.data);
    this.init();
  }
  ngOnDestroy() {
    console.log('destroy', this.formChanges$);
    this.formChanges$.unsubscribe();
  }
  undoEdit(fieldname: string) {
    this.formGroup.patchValue({ [fieldname]: this.initialValues[fieldname] });
    this.fieldsChanged[fieldname] = false;
  }

  private async init() {
    this.fields = await this.getFieldsFromFormDef();
    console.log('fields', arrayToHashmap(this.fields, 'name'));
    this.formGroup = this.buildFormGroupFromFields(this.fields);
    this.initialValues = this.formGroup.value;
    console.log('initialValues', this.initialValues);
    this._subscribeToFormChanges();
    this.isLoading = false;
  }

  public trackByFieldName(index: number, field: ISurveyRowWithValue) {
    return field.name;
  }

  /**
   * Load the formdef for the current data row and extract all questions,
   * labels and select options
   */
  private async getFieldsFromFormDef() {
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
    return fields;
  }

  private buildFormGroupFromFields(fields: ISurveyRowWithValue[]) {
    const formgroup = new FormGroup({});
    for (const field of fields) {
      // TODO - could add validators (but might want a way user can disable first)
      // TODO - handle serialisation of select multiple
      formgroup.addControl(field.name, new FormControl(field.value, []));
    }
    return formgroup;
  }

  private _subscribeToFormChanges() {
    this.formChanges$ = new Subscription();
    Object.entries(this.formGroup.controls).forEach(([name, control]) => {
      const subscription = control.valueChanges.subscribe((v) => {
        const isChanged = v !== this.initialValues[name];
        this.fieldsChanged[name] = isChanged;
      });
      this.formChanges$.add(subscription);
    });
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
