import {
  trigger,
  transition,
  style,
  query,
  animate,
  state,
  sequence,
} from '@angular/animations';

const routeChange = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ opacity: 0 }),
    animate('600ms ease', style({ opacity: 1 })),
  ]),
]);

/**
 * @example <div *ngIf="showMe" @fadeEntryExit>
 */
const fadeEntryExit = trigger('fadeEntryExit', [
  transition(':leave', [
    animate('200ms ease', style({ opacity: 0, height: 0 })),
  ]),
  transition(':enter', [
    style({ opacity: 0 }),
    animate('600ms ease', style({ opacity: 1 })),
  ]),
]);
/**
 * @example <div *ngIf="showMe" @fadeEntryExit>
 * Note - assumes starts out with translateY applied to host
 */
const slideInOut = trigger('slideInOut', [
  state('in', style({ transform: 'translateY(-100%)' })),
  state('out', style({ transform: 'translateY(0)' })),
  transition(
    'in => out',
    sequence([animate('400ms ease-in-out'), style({ display: 'none' })])
  ),
  transition('out => in', [animate('200ms ease-in-out')]),
]);

export default { routeChange, fadeEntryExit, slideInOut };
