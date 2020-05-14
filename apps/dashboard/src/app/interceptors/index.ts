import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse
} from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IStorageKey } from '../types';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Injectable()
export class OdkTablesInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const url = this.rewriteUrl(req.url);
    const odkserverurl = this.getStorage('odkServerUrl');
    // send with basic authentication
    const Authorization = `basic ${this.getStorage('odkToken')}`;
    const modified = req.clone({
      url,
      setHeaders: { odkserverurl, Authorization }
    });
    return next.handle(modified);
  }

  /**
   * @remark Proxy all requests to the /api endpoint
   * (not explicitly stated as /api/odktables in component to keep better fidelity)
   */
  private rewriteUrl(url: string) {
    return url.indexOf('/api') === 0 ? url : `/api${url}`;
  }

  private getStorage(key: IStorageKey): string | undefined {
    const storage = environment.production ? sessionStorage : localStorage;
    return storage.getItem(key);
  }
}

@Injectable()
export class ResponseLoggerInterceptor implements HttpInterceptor {
  res$ = new Subject<Message>();
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map(event => {
        if (event instanceof HttpResponse) {
          console.log('res', event);
          this.res$.next(event.body as Message);
        }
        return event;
      })
    );
  }
}
/**
 * TODO - Link logger with service and display component
 *
 * <div id="debugWindow">
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
