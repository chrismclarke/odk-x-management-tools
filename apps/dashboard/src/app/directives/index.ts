import { Directive, ElementRef, Input, OnDestroy, OnInit, ɵConsole } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { OdkService } from '../services/odk';
import * as IODK from '../types/odk.types';

@Directive({ selector: '[odkxmUserPriviledge]' })
/** Apply user priviledge checks at component level */
export class UserPriviledgeDirective implements OnInit, OnDestroy {
  destroyed$ = new Subject();
  @Input('odkxmUserPriviledge') priviledge: IODK.Priviledge;
  constructor(private el: ElementRef<HTMLButtonElement>, private odkService: OdkService) {}
  ngOnInit() {
    if (this.priviledge) {
      this.odkService.userPriviledges$.pipe(takeUntil(this.destroyed$)).subscribe((u) => {
        const roles = u?.roles || [];
        const canAccess = !this.priviledge || roles.includes(this.priviledge);
        // assign various attributes to apply custom formatting and override some other defualts
        this.el.nativeElement.setAttribute('data-priviledge-required', this.priviledge);
        this.el.nativeElement.setAttribute('data-priviledge-satisfied', `${canAccess}`);

        this.el.nativeElement.setAttribute('ng-reflect-disabled', `${!canAccess}`);
        this.el.nativeElement.setAttribute('disabled', `${!canAccess}`);
        this.el.nativeElement.disabled = !canAccess;
        // add a title so user can see message on hover
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
export class SharedDirectivesModule {}
