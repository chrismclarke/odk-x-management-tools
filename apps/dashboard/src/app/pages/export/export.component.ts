import { Component } from '@angular/core';
import { OdkRestService } from '../../services/odkrest.service';

@Component({
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
})
export class ExportComponent {
  constructor(public odkRest: OdkRestService) {}
}
