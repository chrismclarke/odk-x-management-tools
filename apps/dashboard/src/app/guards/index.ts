import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { OdkService } from '../services/odk';

@Injectable({ providedIn: 'root' })
export class IsConnectedGuard implements CanActivate {
  constructor(private odkService: OdkService, private router: Router) {}
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.odkService.isConnected.value === true) {
      return true;
    } else {
      this.router.navigate(['/connection']);
    }
    // your  logic goes here
  }
}

@Injectable({ providedIn: 'root' })
/** Only allow users with certain odk priviledges to access page */
export class UserPriviledgeGuard implements CanActivate {
  constructor(private odkService: OdkService, private router: Router) {}
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const guardPriviledgeRequired = next.data.guardPriviledgeRequired;
    if (!guardPriviledgeRequired) {
      console.error('No role supplied to priviledge guard');
      return true;
    }
    const { roles } = this.odkService.userPriviledges$.value;
    if (roles.includes(guardPriviledgeRequired)) {
      console.log('has role');
      return true;
    } else {
      this.router.navigate(['/']);
    }
  }
}
