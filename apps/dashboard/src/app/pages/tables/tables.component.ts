import { Component } from '@angular/core';
import { OdkRestService } from '../../services/odkrest.service';

@Component({
  selector: 'odkxm-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
})
export class TablesComponent {
  constructor(public odkRest: OdkRestService) {}
}
