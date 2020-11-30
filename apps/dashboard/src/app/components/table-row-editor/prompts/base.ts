import { ChangeDetectorRef, Component, Input } from '@angular/core';
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

  constructor(private cdr: ChangeDetectorRef) {}

  /*******************************************************************************************
   *  Extendable methods
   *******************************************************************************************/

  /** Apply changes to value received from form, e.g. convert input string to number */
  parseValue: (val: any) => any = null;

  /*******************************************************************************************
   *  Form and Control Bindings
   *******************************************************************************************/

  @Input()
  set value(value: any) {
    // transform any non-null values using specified modifiers
    if (value !== null && this.parseValue) {
      value = this.parseValue(value);
    }
    // propagate any changes to listeners
    if (this._val !== value) {
      this._val = value;
      // update form listeners
      this.onChange(value);
      this.onTouch(value);
      // ensure that components setting values are also aware if the value has changed
      this.detectChanges();
    }
  }
  get value() {
    return this._val;
  }

  public detectChanges() {
    return this.cdr.detectChanges();
  }

  // triggered functions called from form or model bindings
  private onChange: (val: any) => void = () => null;
  private onTouch: (val: any) => void = () => null;

  // programmatically writing the value, call setter above
  writeValue(value: any) {
    this.value = value;
  }
  // method to be triggered on UI change
  registerOnChange = (fn: any) => (this.onChange = fn);

  // method to be triggered on component touch
  registerOnTouched = (fn: any) => (this.onTouch = fn);

  setDisabledState = (isDisabled: boolean) => (this.disabled = isDisabled);
}
