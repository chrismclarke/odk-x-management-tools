import { Component, OnInit, Input } from '@angular/core';
import { ITableMeta } from '../types/odk.types';
import { OdkRestService } from '../services/odkrest.service';

@Component({
  selector: 'odkxm-table-actions',
  template: `
    <button mat-raised-button (click)="backupTable()" [disabled]="disabled">
      Backup Table
    </button>
  `
})
export class TableActionsComponent implements OnInit {
  @Input() table: ITableMeta;
  disabled = false;
  constructor(private odkRest: OdkRestService) {}

  async backupTable() {
    this.disabled = true;
    console.log('backing up table', this.table);
    const status = await this.odkRest.backupTable(this.table);
    this.disabled = false;
  }

  ngOnInit() {}
}
