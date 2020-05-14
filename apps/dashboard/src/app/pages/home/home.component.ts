import { Component } from '@angular/core';
import { OdkRestService } from '../../services/odkrest.service';
import { ITableMeta } from '../../types/odk.types';

@Component({
  selector: 'odkxm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public odkRest: OdkRestService) {}

  setTable(e) {
    console.log('setting table', e);
  }

  compareById(c1: ITableMeta, c2: ITableMeta): boolean {
    return c1 && c2 ? c1.tableId === c2.tableId : c1 === c2;
  }
}
