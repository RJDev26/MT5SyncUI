import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DDLService {

  constructor(private http: HttpClient) { }

  getExchangeNameDLL():Observable<any>{
    return this.http.get<any>(environment.apiBaseUrl + 'DDL/getExchangeNameDLL');
  }

  getBranchDDL():Observable<any>{
    return this.http.get<any>(environment.apiBaseUrl + 'DDL/GetBranchDDL');
  }

  getAccountDDL():Observable<any>{
    return this.http.get<any>(environment.apiBaseUrl + 'DDL/GetAccountDDL');
  }

  getAccountDDLByBranch(branch: any):Observable<any>{
    return this.http.get<any>(environment.apiBaseUrl + `DDL/GetAccountDDL/${branch}`);
  }
}
