import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Origin', '*')
  .set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
  
  constructor(private httpClient: HttpClient) { }

  saveAccountsData(data:any): Observable<any> {
    return this.httpClient.post<any>(environment.apiBaseUrl + 'saveAccounts' , data, { headers: this.headers });
  }

  changePassword(data:any): Observable<any> {
    return this.httpClient.post<any>(environment.apiBaseUrl + 'User/change-password' , data, { headers: this.headers });
  }

  getAccounts():Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Customer/getCustomer',{headers:this.headers});
  }

  getitems():Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getitemlist',{headers:this.headers});
  }

  tradeFileType():Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Common/tradeFileType',{headers:this.headers});
  }

  deleteAccount(id:Number):Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'deleteAccount/' + id,{headers:this.headers});
  }

  getCity(): Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/GetState', {headers:this.headers});
  }

  saveAccount(data): Observable<any>{
    return this.httpClient.post<any>(environment.apiBaseUrl + 'Master/saveAccount', data, {headers:this.headers});
  }

  getProduct():Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getProductList',{headers:this.headers});
  }

  getContract(id: any):Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getContractList/' + id,{headers:this.headers});
  }

  getContractListItemImport(id: any):Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getContractListItemImport/' + id,{headers:this.headers});
  }

  getCompany():Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getCompanyList',{headers:this.headers});
  }

  getBrokerageSetupList(data):Observable<any>{
    return this.httpClient.post<any>(environment.apiBaseUrl + 'Master/getBrokeageSetupList', data, {headers:this.headers});
  }

  getSubBrokeageList(data):Observable<any>{
    return this.httpClient.post<any>(environment.apiBaseUrl + 'Master/getSubBrokeageList', data, {headers:this.headers});
  }

  getBrokerageAddValidation(data):Observable<any>{
    return this.httpClient.post<any>(environment.apiBaseUrl + 'Master/getBrokerageAddValidation', data, {headers:this.headers});
  }

  getSubBrokerageAddValidation(data):Observable<any>{
    return this.httpClient.post<any>(environment.apiBaseUrl + 'Master/getSubBrokerageAddValidation', data, {headers:this.headers});
  }

  getBrokerageSetupListAccount(accountId: number): Observable<any> {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Master/getAcBrokeageSetupList/' + accountId, { headers: this.headers });
  }

  getTax():Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'MasterSecond/getTaxList',{headers:this.headers});
  }

  getIntrestApplyOnDDL(): Observable<any> {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Common/getIntrestApplyOnDDL', { headers: this.headers });
  }
  getIntrestTypeDLL(): Observable<any> {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Common/getIntrestTypeDLL', { headers: this.headers });
  }

  getPostVoucherDLL(): Observable<any> {
    return this.httpClient.get<any>(environment.apiBaseUrl + 'Common/getPostVoucherDLL', { headers: this.headers });
  }

  getUserList():Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'User/getUserList',{headers:this.headers});
  }

  getuserpermission():Observable<any>{
    return this.httpClient.get<any>(environment.apiBaseUrl + 'User/getuserpermission',{headers:this.headers});
  }
}
