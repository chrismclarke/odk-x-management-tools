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
import { IAPIResponse } from '@odkxm/api-interfaces';

@Injectable()
export class ResponseLoggerInterceptor implements HttpInterceptor {
  res$ = new Subject<IAPIResponse>();
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map(event => {
        if (event instanceof HttpResponse) {
          this.res$.next(event.body as IAPIResponse);
        }
        return event;
      })
    );
  }
}
