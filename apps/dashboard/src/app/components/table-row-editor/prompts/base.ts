import { Component, Input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ISurveyWorksheetRow } from '../../../types/odk.types';

@Component({
  template: ``,
})
/**
 * A pseudo-abstract class that automatically handles bindings between standard html form inputs to angular
 * form controls, with optional tranformations. For more background info on why and how this is used see:
 * https://indepth.dev/never-again-be-confused-when-implementing-controlvalueaccessor-in-angular-forms
 * https://medium.com/@ozak/stop-repeating-yourself-in-angular-how-to-create-abstract-components-9726d43c99ab
 */
export class ODKXPromptBase implements ControlValueAccessor {
  disabled = false;
  @Input() odkxColumns: Partial<ISurveyWorksheetRow> = {}; // question object passed to the component

  /** local variable for tracking value and comparisons */
  private _val: any = null;

  constructor() {}

  /*******************************************************************************************
   *  Extendable methods
   *******************************************************************************************/

  /** Apply changes to value prior to propagation. Note, does not apply to null values */
  transformValue(val: string): any {
    return val;
  }

  /*******************************************************************************************
   *  Form and Control Bindings
   *******************************************************************************************/

  @Input()
  set value(value: any) {
    // transform any non-null values using specified modifiers
    if (value !== null) {
      value = this.transformValue(value);
    }
    // propagate any changes to listeners
    if (this._val !== value) {
      this._val = value;
      this.onChange(value);
      this.onTouch(value);
    }
  }
  get value() {
    return this._val;
  }

  // triggered functions called from form or model bindings
  private onChange: (val: any) => void = () => null;
  private onTouch: (val: any) => void = () => null;

  // programmatically writing the value
  writeValue(value: any) {
    // transform any non-null values using specified modifiers
    if (value !== null) {
      value = this.transformValue(value);
    }
    this.value = value;
  }
  // method to be triggered on UI change
  registerOnChange = (fn: any) => (this.onChange = fn);

  // method to be triggered on component touch
  registerOnTouched = (fn: any) => (this.onTouch = fn);

  setDisabledState = (isDisabled: boolean) => (this.disabled = isDisabled);
}
