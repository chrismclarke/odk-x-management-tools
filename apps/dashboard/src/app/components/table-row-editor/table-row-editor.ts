import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { OdkService } from '../../services/odk';
import {
  IFormDef,
  IFormSection,
  ISurveyRowWithValue,
  ISurveyWorksheetRow,
  ITableMeta,
  ITableRow,
  ITableSchema,
} from '../../types/odk.types';
import { FieldsDisplayService } from '../../services/fieldsDisplay.service';
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
  // fields: ISurveyRowWithValue[] = [];
  sections: IFormPromptSection[] = [];
  /** Dynamically change which section should be active in the tabs */
  activeSectionIndex = 0;
  /** Adjust to remove tab change animations */
  tabAnimationSpeed = 2000;
  formGroup: FormGroup = new FormGroup({});
  formChanges$: Subscription;
  /** Keep list of fields that have changed for css styling */
  fieldsChanged: { [name: string]: boolean } = {};
  fieldsChangedArray = [];
  constructor(
    private odkService: OdkService,
    private notifications: NotificationService,
    private fieldsDisplayService: FieldsDisplayService,
    public dialogRef: MatDialogRef<TableRowEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ITableRowEditorData
  ) {}

  ngAfterViewInit() {
    this.init();
  }

  ngOnDestroy() {
    if (this.formChanges$) {
      this.formChanges$.unsubscribe();
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  private async init() {
    this.sections = await this.getFormDefPromptsBySection();
    this.formGroup = this.buildFormGroupFromSections(this.sections);
    this.initialValues = this.formGroup.value;
    console.log('initialValues', this.initialValues);
    this._subscribeToFormChanges();
    this.isLoading = false;
    setTimeout(() => {
      this.scrollToField(this.data.colId);
    }, 50);
  }

  /**
   * When saving edits post to api, show response message, and update local bindings
   * to reflect new default state for change tracking
   */
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

  public trackByFieldName(index: number, field: ISurveyRowWithValue) {
    return field.name;
  }

  private scrollToField(fieldname: string) {
    // Determine relevant section, swap to it (without animation)
    const targetSection = this.sections.findIndex((s) =>
      s.prompts.find((p) => p.name === fieldname)
    );
    if (targetSection !== this.activeSectionIndex) {
      this.tabAnimationSpeed = 0;
      this.activeSectionIndex = targetSection || 0;
      setTimeout(() => {
        this.tabAnimationSpeed = 2000;
      }, 50);
    }
    setTimeout(() => {
      // locate relevant element and scroll to it
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
        // add class for css focus animation
        scrollTarget.classList.add('scroll-target');
      }
    }, 500);
  }

  /**
   * Load the formdef for the current data row and extract all questions,
   * labels and select options
   */
  private async getFormDefPromptsBySection() {
    const { table, row } = this.data;
    const values = row;
    const { tableId } = table;
    const formdef: IFormDef = await this.odkService.getFormdef(tableId);
    const sectionLabels = this.odkService.getFormdefSectionLabels(formdef);
    console.log('formdef', formdef);
    // const promptsByName = extractFormdefPromptsByName(formdef);
    // console.log('promptsByName', promptsByName);
    const sections: IFormPromptSection[] = Object.values(formdef.specification.sections)
      .filter((s) => s.section_name !== 'initial')
      .map((s) => ({
        ...s,
        section_label: sectionLabels[s.section_name],
        prompts: this.mapSectionPrompts(s.prompts, values, formdef.specification.choices),
      }))
      // hide sections without any prompts
      .filter((s) => s.prompts.length > 0);
    console.log('sections', sections);
    return sections;
  }
  /**
   * For each prompt lookup and assign any values and values_list options
   * Apply custom fieldsDisplay configuration overrids
   */
  private mapSectionPrompts(
    prompts: ISurveyWorksheetRow[],
    values: { [prompt_name: string]: any },
    choices: IFormDef['specification']['choices']
  ) {
    const mappedPrompts: ISurveyRowWithValue[] = [];
    prompts.forEach((prompt) => {
      // filter to include only named prompts that exist in values
      const { name } = prompt;
      if (name && values.hasOwnProperty(name)) {
        const field: ISurveyRowWithValue = { ...prompt, value: values[name] };
        // populate choice values where requierd
        if (field.hasOwnProperty('values_list')) {
          field.select_options = choices[field.values_list].map((v) => ({
            value: v.data_value,
            label: v.display.title.text,
          }));
        }
        mappedPrompts.push(field);
      }
    });
    // Apply custom fields display configuration overrides
    const { tableId } = this.odkService.table$.value;
    const displayFieldPrompts = this.applyFieldDisplayConfiguration(mappedPrompts, tableId);
    return displayFieldPrompts;
  }
  /** Load any custom display changes due to displayFields configuration  */
  private applyFieldDisplayConfiguration(fields: ISurveyRowWithValue[], tableId: string) {
    return fields
      .filter((f) => !this.fieldsDisplayService.getFieldHidden(tableId, f.name))
      .map((f) => {
        const _fieldDisplayDisabled = this.fieldsDisplayService.getFieldDisabled(tableId, f.name);
        return { ...f, _fieldDisplayDisabled };
      });
  }

  /**
   * Create a formgroup based on the prompts that appear in the different form sections
   * Note - this could be initialised from values, but better to access full prompt objects in
   * case wanting to include validators or validating by section
   * */
  private buildFormGroupFromSections(sections: IFormPromptSection[]) {
    const formgroup = new FormGroup({});
    for (const section of sections) {
      for (const prompt of section.prompts) {
        formgroup.addControl(prompt.name, new FormControl(prompt.value, []));
      }
    }
    // TODO - could add validators (but might want a way user can disable first)
    // TODO - validators could also include data type expected (although most parse strings fine so maybe not to worry?)
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

export interface ITableRowEditorData {
  row: ITableRow;
  /** field id user clicked when opening editor, for scrolling */
  colId: string;
  table: ITableMeta;
  schema: ITableSchema;
}

interface IFormPromptSection extends IFormSection {
  section_label: string;
  prompts: ISurveyRowWithValue[];
}
