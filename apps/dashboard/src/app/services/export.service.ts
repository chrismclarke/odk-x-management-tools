import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor() {
    console.log('papa', Papa);
  }

  exportToCSV(data: any) {
    console.log('exporting to csv', data);
    const csvData = Papa.unparse(data);
    console.log('csvData', csvData);
  }
}
