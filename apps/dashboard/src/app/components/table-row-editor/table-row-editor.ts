import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { arrayToHashmap } from '../../utils/utils';
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
  @ViewChild('formEl', { static: false }) formEl: ElementRef<HTMLDivElement>;
  isLoading = true;
  isSaving = false;
  initialValues: { [fieldname: string]: string };
  fields: ISurveyRowWithValue[] = [];
  formGroup: FormGroup = new FormGroup({});
  formChanges$: Subscription;
  /** Keep list of fields that have changed for css styling */
  fieldsChanged: { [name: string]: boolean } = {};
  fieldsChangedArray = [];
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
    const summary = {};
    // just process entries which have been marked as updated, and apply to original document
    Object.entries(this.fieldsChanged)
      .filter(([_, isChanged]) => isChanged)
      .forEach(([fieldname]) => {
        const updateValue = updatedValues[fieldname];
        updatedRow[fieldname] = updateValue;
        summary[fieldname] = { before: this.initialValues[fieldname], after: updateValue };
      });
    console.table(summary);
    const res = await this.odkService.updateRows([updatedRow]);
    // handle response
    if (res.rows[0].outcome === 'SUCCESS') {
      this.notifications.showMessage(`save - ${res.rows[0].outcome}`, 'success', {
        duration: 2000,
      });
      // Update locally stored metadata
      // TODO - this is duplicated form updates done in service, so could probably just pass back somehow
      this.data.row = {
        ...this.data.row,
        _data_etag_at_modification: res.dataETag,
        _row_etag: res.rows[0].rowETag,
      };
      // Re-initialised value change tracking
      this.fieldsChanged = {};
      this.fieldsChangedArray = [];
      this.initialValues = updatedValues;
      this.formGroup.reset(this.initialValues);
    } else {
      // TODO - handle partial success
      this.notifications.showMessage(`save - ${res.rows[0].outcome}`, 'error', { duration: 3500 });
    }
    this.isSaving = false;
  }

  ngAfterViewInit() {
    this.init();
  }
  ngOnDestroy() {
    if (this.formChanges$) {
      this.formChanges$.unsubscribe();
    }
  }
  undoEdit(fieldname: string) {
    const initialValue = this.initialValues[fieldname];
    this.formGroup.patchValue({ [fieldname]: initialValue });
    this.notifyFieldChanged(fieldname, initialValue);
  }
  /** Update local field change trackers to reflect overall change summaries **/
  private notifyFieldChanged(fieldname: string, value: any) {
    const isChanged = value !== this.initialValues[fieldname];
    if (isChanged) {
      this.fieldsChanged[fieldname] = true;
    } else {
      if (this.fieldsChanged.hasOwnProperty(fieldname)) {
        delete this.fieldsChanged[fieldname];
      }
    }
    this.fieldsChangedArray = Object.entries(this.fieldsChanged).map(([name, v]) => ({
      name,
      before: this.initialValues[name],
      after: value,
    }));
  }

  private async init() {
    const fields = await this.getFieldsFromFormDef();
    this.fields = fields;
    console.log('fields', arrayToHashmap(this.fields, 'name'));
    this.formGroup = this.buildFormGroupFromFields(this.fields);
    this.initialValues = this.formGroup.value;
    console.log('initialValues', this.initialValues);
    this._subscribeToFormChanges();
    this.isLoading = false;
    setTimeout(() => {
      this.scrollToField(this.data.colId);
    }, 50);
  }

  public trackByFieldName(index: number, field: ISurveyRowWithValue) {
    return field.name;
  }

  private scrollToField(fieldname: string) {
    const formEl = this.formEl.nativeElement;
    formEl.scrollTop = 0;
    const scrollTarget = formEl.querySelector(`#field-container-${fieldname}`) as HTMLDivElement;
    if (scrollTarget) {
      // manual implementation instead of scrollIntoView as seems inconsistent
      // adjustment for other inconsistencies, not really sure why...
      formEl.scroll({
        top: scrollTarget.offsetTop - 119,
        behavior: 'smooth',
      });
    }
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
        this.notifyFieldChanged(name, v);
      });
      this.formChanges$.add(subscription);
    });
  }
}

interface ISurveyRowWithValue extends ISurveyWorksheetRow {
  value: string;
  select_options?: any[];
}
export interface ITableRowEditorData {
  row: ITableRow;
  /** field id user clicked when opening editor, for scrolling */
  colId: string;
  table: ITableMeta;
  schema: ITableSchema;
}
