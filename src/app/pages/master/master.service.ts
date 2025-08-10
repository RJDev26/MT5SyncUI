import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, shareReplay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MasterService {
  headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Origin', '*')
  .set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');

  private cacheAcHeadAccountList = new Map<number, Observable<any>>();
  
  constructor(private httpClient: HttpClient) { }

  getAccountTaxList(): Observable<any> {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getAccountTaxList', { headers: this.headers })
  }

  getExchangeTaxList(): Observable<any> {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getExchangeTaxList', { headers: this.headers })
  }

  getBrokeageSetupList(): Observable<any> {
    return this.httpClient.post<any>(environment.apiBaseUrl + 'Master/getBrokeageSetupList/', { headers: this.headers })
  }

  getItemMasterList(): Observable<any> {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getItemmast', { headers: this.headers })
  }

  getSaudaMasterList(): Observable<any> {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getSaudamast', { headers: this.headers })
  }

  getScriptMasterList(): Observable<any> {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getScriptmast', { headers: this.headers })
  }

  getContractMasterList(): Observable<any> {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getcontractmast', { headers: this.headers })
  }

  getAccountList(filter: string): Observable<any> {
    const routeParam = filter.toLowerCase();
    return this.httpClient.get<any>(`${environment.apiBaseUrl}Master/getAccountist/${routeParam}`, { headers: this.headers });
  }

}
