import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportToCSV(data: any, filename: string) {
    const csvData = Papa.unparse(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    return saveAs(blob, filename);
  }
}
