import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IStorageKey } from '../types';

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
