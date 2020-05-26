import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { ITableRow } from '../types/odk.types';

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportToCSV(data: IExportData) {
    const csvData = Papa.unparse(data.csvRows);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    return saveAs(blob, data.filename);
  }
  async exportToCSVZip(data: IExportData[], filename: string) {
    const zip = new JSZip();
    for (const d of data) {
      const csvData = Papa.unparse(d.csvRows);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      zip.file(d.filename, blob, {});
    }
    console.log('zip', zip);
    return zip.generateAsync({ type: 'blob' }).then(blob => {
      saveAs(blob, filename);
    });
  }
}

interface IExportData {
  filename: string;
  csvRows: ITableRow[];
}
