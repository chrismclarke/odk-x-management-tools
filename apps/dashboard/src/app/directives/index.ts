import { Directive, ElementRef, Input, OnDestroy, OnInit, ɵConsole } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { OdkService } from '../services/odk';
import { IUserPriviledge } from '../types/odk.types';

@Directive({ selector: '[odkxmUserPriviledge]' })
/** Apply user priviledge checks at component level */
export class UserPriviledgeDirective implements OnInit, OnDestroy {
  destroyed$ = new Subject();
  @Input('odkxmUserPriviledge') priviledge: IUserPriviledge['roles'][0];
  constructor(private el: ElementRef<HTMLDivElement>, private odkService: OdkService) {}
  ngOnInit() {
    if (this.priviledge) {
      this.odkService.userPriviledges$.pipe(takeUntil(this.destroyed$)).subscribe((u) => {
        const roles = u?.roles || [];
        const canAccess = !this.priviledge || roles.includes(this.priviledge);
        this.el.nativeElement.setAttribute('data-priviledge-required', this.priviledge);
        this.el.nativeElement.setAttribute('data-priviledge-satisfied', `${canAccess}`);
        const title = canAccess ? '' : `${this.priviledge} user role required`;
        this.el.nativeElement.setAttribute('title', title);
      });
    }
  }
  ngOnDestroy() {
    console.log('destroyed');
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}

import { NgModule } from '@angular/core';
import { Subject } from 'rxjs';

@NgModule({
  imports: [],
  exports: [UserPriviledgeDirective],
  declarations: [UserPriviledgeDirective],
  providers: [],
})
export class AppDirectivesModule {}
