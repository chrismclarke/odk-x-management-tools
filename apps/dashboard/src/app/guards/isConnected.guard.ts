import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { OdkRestService } from '../services/odkrest.service';

@Injectable({ providedIn: 'root' })
export class IsConnectedGuard implements CanActivate {
  constructor(private odkRestService: OdkRestService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.odkRestService.isConnected) {
      return true;
    } else {
      this.router.navigate(['/connection']);
    }
    // your  logic goes here
  }
}
