import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app-routing.module';
import { OdkService } from './services/odk';
import Animations from './animations';

@Component({
  selector: 'odkxm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [Animations.routeChange],
})
export class AppComponent {
  appVersion = environment.appVersion;
  pages: IPage[];
  constructor(public odkService: OdkService) {
    this.pages = routes
      .filter((r) => r.data && r.data.menu)
      .map((r) => r.data.menu as any);
  }
  /**
   * Use the title of the page to assign/change animation state
   */
  getAnimation(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.menu?.title;
  }
  getTitle(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.menu?.title || '';
  }
}
interface IPage {
  title: string;
  link: string;
  icon: string;
}
