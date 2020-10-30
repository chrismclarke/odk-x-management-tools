import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { OdkService } from '../services/odk';

@Injectable({ providedIn: 'root' })
export class IsConnectedGuard implements CanActivate {
  constructor(private odkService: OdkService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.odkService.isConnected.value === true) {
      return true;
    } else {
      this.router.navigate(['/connection']);
    }
    // your  logic goes here
  }
}
