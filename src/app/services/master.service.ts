import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ClientMasterRequest,
  LoginClientInfo,
  LoginOption,
} from './master.models';

export interface MasterItem {
  id: number;
  code: string;
  name: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class MasterService {
  constructor(private http: HttpClient) {}

  getManagers(): Observable<MasterItem[]> {
    return this.http.get<MasterItem[]>(
      environment.apiBaseUrl + 'api/Master/managers'
    );
  }

  saveManager(item: { id: number; code: string; name: string }): Observable<any> {
    return this.http.post(environment.apiBaseUrl + 'api/Master', {
      tableName: 'Manager',
      ...item,
    });
  }

  deleteManager(id: number): Observable<any> {
    const params = new HttpParams()
      .set('tableName', 'Manager')
      .set('id', id);
    return this.http.delete(environment.apiBaseUrl + 'api/Master', { params });
  }

  getBrokers(): Observable<MasterItem[]> {
    return this.http.get<MasterItem[]>(
      environment.apiBaseUrl + 'api/Master/brokers'
    );
  }

  saveBroker(item: { id: number; code: string; name: string }): Observable<any> {
    return this.http.post(environment.apiBaseUrl + 'api/Master', {
      tableName: 'Broker',
      ...item,
    });
  }

  deleteBroker(id: number): Observable<any> {
    const params = new HttpParams()
      .set('tableName', 'Broker')
      .set('id', id);
    return this.http.delete(environment.apiBaseUrl + 'api/Master', { params });
  }

  getLogins(): Observable<LoginOption[]> {
    return this.http.get<LoginOption[]>(
      environment.apiBaseUrl + 'api/Master/logins'
    );
  }

  getExchanges(): Observable<MasterItem[]> {
    return this.http.get<MasterItem[]>(
      environment.apiBaseUrl + 'api/Master/exchanges'
    );
  }

  getCurrencies(): Observable<MasterItem[]> {
    return this.http.get<MasterItem[]>(
      environment.apiBaseUrl + 'api/Master/currencies'
    );
  }

  getLoginsWithClientInfo(
    login: number | null,
    onlyWithClientRecord: boolean
  ): Observable<LoginClientInfo[]> {
    let params = new HttpParams().set(
      'onlyWithClientRecord',
      String(onlyWithClientRecord)
    );
    if (login !== null) {
      params = params.set('login', String(login));
    }
    return this.http.get<LoginClientInfo[]>(
      environment.apiBaseUrl + 'api/Master/logins-with-client-info',
      { params }
    );
  }

  saveClientMaster(req: ClientMasterRequest): Observable<any> {
    return this.http.post(
      environment.apiBaseUrl + 'api/Master/client-master',
      req
    );
  }

  deleteClientMaster(id: number): Observable<any> {
    const params = new HttpParams().set('id', id);
    return this.http.delete(
      environment.apiBaseUrl + 'api/Master/client-master',
      { params }
    );
  }
}

export { ClientMasterRequest, LoginClientInfo, LoginOption } from './master.models';
