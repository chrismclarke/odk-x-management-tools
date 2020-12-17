import { Pipe, PipeTransform } from '@angular/core';
import { FieldsDisplayService } from '../services/fieldsDisplay.service';

@Pipe({
  name: 'appFieldsDisplay',
})
/**
 * The fields display pipe provides methods to augment data before being rendered in a component
 * in line with the custom fields display
 *
 * This includes filtering out tables or fields that should be globally or specifically hidden
 */
export class FieldsDisplayPipe implements PipeTransform {
  constructor(private fieldsDisplayService: FieldsDisplayService) {}
  /**
   * Main transformation method to handle table and field augmentations
   * @param value - variable to pass to filter functions
   * @param args - specify `tables` to process list of table values, or `fields` to process specific fields
   * @example Process a list of tables by setting the 'tables' arg
   * ```
   * <div *ngFor="let table of allTables | appFieldsDisplay: 'tables'">
   * ```
   * @example Process a list of fields by setting the 'fields' arg alongside the specific tableId for lookup
   * ```
   * <div *ngFor="let field of fields | appFieldsDisplay: 'fields' tableId">
   * ```
   */
  transform(value: any, ...args: any[]): any {
    const transformation: 'tables' | 'fields' = args[0];
    const tableId: string = args[1];
    if (transformation === 'tables') {
      return this.fieldsDisplayService.filterHiddenTables(value);
    }
    if (transformation === 'fields' && tableId) {
      return this.fieldsDisplayService.filterHiddenFields(tableId, value);
    }
    return value;
  }
}
