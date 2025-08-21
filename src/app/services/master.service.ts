import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

  getLogins(): Observable<number[]> {
    return this.http.get<number[]>(
      environment.apiBaseUrl + 'api/Master/logins'
    );
  }

  getLoginsWithClientInfo(
    login: number,
    onlyWithClientRecord: boolean
  ): Observable<LoginClientInfo[]> {
    const params = new HttpParams()
      .set('login', String(login))
      .set('onlyWithClientRecord', String(onlyWithClientRecord));
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

export interface ClientMasterRequest {
  action: string;
  id: number;
  login: number;
  managerId: number;
  brokerId: number;
  exId: number;
  brokShare: number;
  managerShare: number;
  currency: string;
  commission: number;
  createdBy: number;
}

export interface LoginClientInfo {
  login: number;
  userName: string;
  clientId: number | null;
  managerName: string;
  brokerName: string;
  exchange: string;
  brokShare: number | null;
  managerShare: number | null;
  currency: string;
  commission: number | null;
  createdDate: string | null;
}


