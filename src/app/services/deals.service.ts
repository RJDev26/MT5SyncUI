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
  lastIP: string;
  qty: number;
  price: number;
  profit: number;
  commission: number;
  comment: string;
}

export interface OrderRow {
  login: number;
  time: string;
  order: number;
  symbol: string;
  lastIP: string;
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
  date: string;
  dateString: string;
  buyTimeString: string;
  sellTimeString: string;
}

export interface StandingRow {
  tradeDate: string;
  login: number;
  symbol: string;
  buyQty: number;
  sellQty: number;
  netQty?: number;
  brokerShare?: number;
  managerShare?: number;
}

export interface LiveSummaryRow {
  login?: number;
  symbol?: string;
  openQty: number;
  openRate: number;
  openAmt: number;
  buyQty: number;
  buyAmt: number;
  sellQty: number;
  sellAmt: number;
  closeQty: number;
  closeRate: number;
  closeAmt: number;
  grossMTM: number;
  netAmt: number;
}

export interface CrossTradeSummaryRow {
  symbol: string;
  lastIP: string;
  login1: number;
  login2: number;
  firstTradeTime: string;
  lastTradeTime: string;
  deals: number;
  bDeals: number;
  sDeals: number;
}

export interface CrossTradeDetailRow {
  symbol: string;
  lastIP: string;
  login1: number;
  login2: number;
  rowSide: string;
  login: number;
  time: string;
  deal: number;
  conType: string;
  qty: number;
  price: number;
  volume: number;
  volumeext: number;
  profit: number;
  commission: number;
  comment: string;
}

export interface DealHistoryRow {
  login: number;
  time: string;
  deal: number;
  symbol: string;
  contype: string;
  qty: number;
  price: number;
  profit: number;
  commission: number;
  comment: string;
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

  getOrdersSnapshot(): Observable<{ rows: OrderRow[]; maxTime: string | null; rowCount: number }> {
    return this.http.get<{ rows: OrderRow[]; maxTime: string | null; rowCount: number }>(
      environment.apiBaseUrl + 'api/Deals/orders-snapshot'
    );
  }

  getJobbingDeals(
    fromTime: string,
    toTime: string,
    intervalMinutes: number
  ): Observable<{ rows: JobbingDealRow[]; maxTime: string | null; rowCount: number }> {
    const params = new HttpParams()
      .set('fromTime', fromTime)
      .set('toTime', toTime)
      .set('intervalMinutes', intervalMinutes);
    return this.http.get<{ rows: JobbingDealRow[]; maxTime: string | null; rowCount: number }>(
      environment.apiBaseUrl + 'api/Deals/jobbing-deals',
      { params }
    );
  }

  getStanding(
    date: string,
    login?: number | null,
    symbol?: string | null,
    option?: 'summary' | 'login' | 'symbol'
  ): Observable<{ rows: StandingRow[] }> {
    let params = new HttpParams().set('date', date);
    if (login != null) {
      params = params.set('login', String(login));
    }
    if (symbol) {
      params = params.set('symbol', symbol);
    }
    if (option) {
      params = params.set('option', option);
    }
    return this.http.get<{ rows: StandingRow[] }>(
      environment.apiBaseUrl + 'api/Deals/standing',
      { params }
    );
  }

  getLiveSummary(
    from: string,
    to: string,
    managerId?: number,
    option?: 'SymbolWise' | 'LoginWise' | 'Detail'
  ): Observable<{ rows: LiveSummaryRow[]; rowCount: number }> {
    let params = new HttpParams().set('from', from).set('to', to);
    if (managerId != null) {
      params = params.set('managerId', String(managerId));
    }
    if (option) {
      params = params.set('option', option);
    }
    return this.http.get<{ rows: LiveSummaryRow[]; rowCount: number }>(
      environment.apiBaseUrl + 'api/Deals/live-summary',
      { params }
    );
  }

  getDealHistory(
    from: string,
    to: string,
    login?: number
  ): Observable<{ rows: DealHistoryRow[]; rowCount: number }> {
    let params = new HttpParams().set('from', from).set('to', to);
    if (login != null) {
      params = params.set('login', String(login));
    }
    return this.http.get<{ rows: DealHistoryRow[]; rowCount: number }>(
      environment.apiBaseUrl + 'api/Deals/deal-history',
      { params }
    );
  }

  getCrossTradePairs(
    from: string,
    to: string
  ): Observable<{ rows: CrossTradeSummaryRow[]; details: CrossTradeDetailRow[] }> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<{ rows: CrossTradeSummaryRow[]; details: CrossTradeDetailRow[] }>(
      environment.apiBaseUrl + 'api/Deals/cross-trade-pairs',
      { params }
    );
  }
}
