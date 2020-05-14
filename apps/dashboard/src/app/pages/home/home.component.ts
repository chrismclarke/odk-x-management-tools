import { Component } from '@angular/core';
import { OdkRestService } from '../../services/odkrest.service';

@Component({
  selector: 'odkxm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public odkRest: OdkRestService) {}
}
