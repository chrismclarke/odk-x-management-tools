import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITableRow } from '../types/odk.types';

@Component({
  selector: 'odkxm-table-row-editor',
  template: `<div style="display:flex; flex-direction:column; height:100%">
    <h2 mat-dialog-title>Edit Row</h2>
    <div mat-dialog-content>Dialog Content</div>

    <div mat-dialog-actions style="margin-top:auto; margin-left:auto">
      <button mat-button (click)="cancel()" cdkFocusInitial>Cancel</button>
      <button mat-button (click)="saveEdits()">Save Edits</button>
    </div>
  </div>`,
})
export class TableRowEditorDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<TableRowEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ITableRowEditorData
  ) {}

  cancel() {
    this.dialogRef.close();
  }
  saveEdits() {}

  ngOnInit() {
    console.log('row editor', this.data);
  }
}
export interface ITableRowEditorData {
  row: ITableRow;
}
