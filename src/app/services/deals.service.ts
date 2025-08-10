import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DealRow {
  Login: string;
  Time: string;
  Deal: string;
  Symbol: string;
  ConType: string;
  Entry: string;
  Qty: number;
  Price: number;
  Volume: number;
  VolumeExt: number;
  Profit: number;
  Commission: number;
  Comment: string;
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
}
