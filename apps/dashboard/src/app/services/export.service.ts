import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor() {
    console.log('papa', Papa);
  }

  exportToCSV(data: any, filename: string) {
    console.log('exporting to csv', data);
    const csvData = Papa.unparse(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    return saveAs(blob, filename);
  }
}
