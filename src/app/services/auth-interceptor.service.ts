import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(public snackBar: MatSnackBar,  public router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Retrieve the authorization token from your authentication service
    const authToken = localStorage.getItem('token');

    // Clone the request and add the Authorization header
    const authReq = req.clone({
     // setHeaders: { Authorization: `Bearer ${authToken}` },
      headers: req.headers.set(
        'Authorization',
        'Bearer ' + localStorage.getItem('token')
      )

    });

    return next.handle(authReq).pipe(catchError((error: HttpErrorResponse) => {
      console.log('error', error);
      if(error.status === 401){
        this.showToaster('Login session got expired.', true)
        localStorage.clear();
        this.router.navigate(['login']);
      }
      return throwError(error);
    }));
  }

  showToaster(message: string, isError = false) {
    const panelClass = isError ? ['red-text'] : undefined;
    const label = isError ? "Error" : "Success";
    const time = isError? 6000 : 3000;
  
    this.snackBar.open(message, label, {
      duration: time,
      panelClass: panelClass,
    });
  }
}
