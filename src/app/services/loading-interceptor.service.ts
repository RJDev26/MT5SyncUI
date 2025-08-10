import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppSettings } from '../app.settings';
import { Settings } from '../app.settings.model';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
    public settings: Settings;
  constructor( public appSettings: AppSettings) {
    this.settings = this.appSettings.settings;
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.settings.loadingSpinner = true; 
    return next.handle(req).pipe(
      finalize(() => {
        this.settings.loadingSpinner = false; 
      })
    );
  }
}
