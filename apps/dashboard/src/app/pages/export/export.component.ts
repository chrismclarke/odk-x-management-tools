import { Component } from '@angular/core';
import { OdkService } from '../../services/odk';

@Component({
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
})
export class ExportComponent {
  constructor(public odkService: OdkService) {}
}
