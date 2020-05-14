import { Component } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'odkxm-api-debugger',
  template: `
    <div id="debugWindow">
      <div *ngIf="res$ | async as res; else loading">
        <div class="debug-status" [attr.data-status]="res.status">
          <strong>{{ res.status }}</strong> {{ res.message }}
        </div>
        <hr />
        <div [innerHTML]="res.data"></div>
      </div>
      <ng-template #loading>...</ng-template>
    </div>
    */
  `,
  styles: [
    `
      #debugWindow {
        height: 50px;
        overflow: auto;
        border: 1px solid var(--color-light);
        padding: 5px;
        margin-top: auto;
      }
      .debug-status[data-status='401'] {
        color: #bd3333;
      }
    `
  ]
})
/**
 * WIP - template previously used to log all api responses
 * TODO - Link logger with interceptor/notification service
 * */
export class ApiDebuggerComponents {
  res$: Subject<any>;
}
