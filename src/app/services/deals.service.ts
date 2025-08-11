import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DealRow {
  login: number;
  time: string;
  deal: number;
  symbol: string;
  contype: string;
  qty: number;
  price: number;
  volume: number;
  volumeext: number;
  profit: number;
  commission: number;
  comment: string;
}

export interface OrderRow {
  login: number;
  time: string;
  order: number;
  symbol: string;
  qty: number;
  price: number;
  volume: number;
  orderType: number;
  orderTypeName: string;
}

export interface JobbingDealRow {
  login: number;
  buyTime: string;
  sellTime: string;
  buyDeal: number;
  sellDeal: number;
  diffSec: number;
  symbol: string;
  buySymbol: string;
  sellSymbol: string;
  international: string;
  bQty: number;
  sQty: number;
  buyPrice: number;
  sellPrice: number;
  priceDiff: number;
  mtm: number;
  comm: number;
  commR: number;
  mtmr: number;
  date: string;
  dateString: string;
  buyTimeString: string;
  sellTimeString: string;
}

@Injectable({ providedIn: 'root' })
export class DealsService {
  constructor(private http: HttpClient) {}

  getLiveDeals(params: {
    date: string;
    sinceTime?: string;
    symbol?: string;
    action?: string;
    pageSize?: number;
    asc?: boolean;
  }): Observable<{ rows: DealRow[]; maxTime: string | null; rowCount: number }> {
    const httpParams = new HttpParams({ fromObject: params as any });
    return this.http.get<{ rows: DealRow[]; maxTime: string | null; rowCount: number }>(
      environment.apiBaseUrl + 'api/Deals/live',
      { params: httpParams }
    );
  }

  getOrdersSnapshot(): Observable<OrderRow[]> {
    return this.http.get<OrderRow[]>(
      environment.apiBaseUrl + 'api/Deals/orders-snapshot'
    );
  }

  getJobbingDeals(intervalMinutes: number): Observable<JobbingDealRow[]> {
    const params = new HttpParams().set('intervalMinutes', intervalMinutes);
    return this.http.get<JobbingDealRow[]>(
      environment.apiBaseUrl + 'api/Deals/jobbing-deals',
      { params }
    );
  }
}
