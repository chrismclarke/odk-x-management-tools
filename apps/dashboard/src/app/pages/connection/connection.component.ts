import { Component } from '@angular/core';
import { OdkRestService } from '../../services/odkrest.service';

@Component({
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss'],
})
export class ConnectionComponent {
  constructor(public odkRest: OdkRestService) {}
}
