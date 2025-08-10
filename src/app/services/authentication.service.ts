
import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private authChangeSub = new BehaviorSubject<boolean>(false)
  authChanged$ = this.authChangeSub.asObservable();
  private userDataSubject = new BehaviorSubject<any>(null);
  userData$ = this.userDataSubject.asObservable();

  headers = new HttpHeaders()
    .set('content-type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');

  constructor(private httpClient: HttpClient) { }

  Login(formData: any): Observable<any> {
    return this.httpClient.post<any>(environment.apiBaseUrl + 'api/Auth/login', formData);
  }

  getUserData():Observable<any>{
    if(!this.userDataSubject.value){
      const userData = localStorage.getItem('userData');
      if(userData){
        this.userDataSubject.next(JSON.parse(userData));
      }
    }
    return this.userData$;
  }

  saveUserData(data: any){
    this.userDataSubject.next(data);
  }

  sendAuthStateChangeNotification(isAuthenticated: boolean) {
    this.authChangeSub.next(isAuthenticated);
  }

  public logout = () => {
    localStorage.removeItem("token");
    this.sendAuthStateChangeNotification(false);
  }
}
