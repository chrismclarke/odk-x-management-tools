import { Component, Input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ISurveyWorksheetRow } from '../../../types/odk.types';

@Component({
  selector: 'odkxm-prompt-integer',
  template: ``,
})
/**
 * A pseudo-abstract class that automatically handles bindings between standard html form inputs to angular
 * form controls, with optional tranformations. For more background info on why and how this is used see:
 * https://indepth.dev/never-again-be-confused-when-implementing-controlvalueaccessor-in-angular-forms
 * https://medium.com/@ozak/stop-repeating-yourself-in-angular-how-to-create-abstract-components-9726d43c99ab
 */
export class PromptBase implements ControlValueAccessor {
  disabled = false;
  @Input() prompt: Partial<ISurveyWorksheetRow> = {}; // question object passed to the component

  /** local variable for tracking value and comparisons */
  private _val: any = null;

  constructor() {}

  /*******************************************************************************************
   *  Extendable methods
   *******************************************************************************************/

  /** Apply changes to value prior to propagation */
  transformValue(val: any) {
    return val;
  }
  /** Optional functions to perform after changes have been propagated  */
  afterChange(val: any) {
    return;
  }

  /*******************************************************************************************
   *  Form and Control Bindings
   *******************************************************************************************/

  @Input()
  set value(value: any) {
    const transformedValue = this.transformValue(value);
    if (this._val !== transformedValue) {
      this._val = transformedValue;
      this.onChange(transformedValue);
      this.onTouch(transformedValue);
      this.afterChange(transformedValue);
    } else {
      // notify any parent that the value received has already been transformed
      // (but perhaps not updated in parent component - input box might require manual change)
      if (transformedValue !== value) {
        this.afterChange(transformedValue);
      }
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
    this.value = Math.round(Number(value));
  }
  // method to be triggered on UI change
  registerOnChange = (fn: any) => (this.onChange = fn);

  // method to be triggered on component touch
  registerOnTouched = (fn: any) => (this.onTouch = fn);

  setDisabledState = (isDisabled: boolean) => (this.disabled = isDisabled);
}
