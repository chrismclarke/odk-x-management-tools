import { Component } from '@angular/core';
import { OdkRestService } from '../../services/odkrest.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'odkxm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  appVersion = environment.appVersion;
  constructor(public odkRest: OdkRestService) {}
}
