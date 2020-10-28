import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { routes } from './app-routing.module';
import { OdkRestService } from './services/odkrest.service';

@Component({
  selector: 'odkxm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  appVersion = environment.appVersion;
  pages: IPage[];
  constructor(public odkRestService: OdkRestService) {
    this.pages = routes
      .filter((r) => r.data && r.data.menu)
      .map((r) => r.data.menu as any);
  }
}
interface IPage {
  title: string;
  link: string;
  icon: string;
}
