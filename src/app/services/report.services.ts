import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }

  getBranchSharingReport(body: any):Observable<any>{
    return this.http.post<any>(environment.apiBaseUrl + 'Report/getBranchSharingReport', body);
  }

  getBillSummary(body: any): Observable<any> {
    return this.http.post<any>(environment.apiBaseUrl + 'Report/GetBillSummary', body);
  }

  getSaudaStanding(body: any): Observable<any> {
    return this.http.post<any>(environment.apiBaseUrl + 'Report/get-sauda-standing', body);
  }

  getTrialBalance(body: any): Observable<any> {
    return this.http.post<any>(environment.apiBaseUrl + 'Report/GetTrialBalance', body);
  }

  getGeneralLedger(body: any): Observable<any> {
    return this.http.post<any>(environment.apiBaseUrl + 'Report/general-ledger', body);
  }
}
