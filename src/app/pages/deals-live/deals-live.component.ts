import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealRow, DealsService } from '@services/deals.service';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';
import { AgGridModule, AgGridAngular } from 'ag-grid-angular';
import { interval, Subscription, switchMap, tap } from 'rxjs';

ModuleRegistry.registerModules([AllCommunityModule]);

const SAMPLE_ROWS: DealRow[] = [
  {
    login: 1083,
    time: '2025-08-08T09:11:58',
    deal: 117381,
    symbol: 'GC-Z25',
    contype: '0',
    entry: 1,
    qty: 0.5,
    price: 3495.3,
    volume: 5000,
    volumeext: 50000000,
    profit: -640,
    commission: -1.5,
    comment: ' '
  },
  {
    login: 1105,
    time: '2025-08-08T09:11:29',
    deal: 117379,
    symbol: 'GC-Z25',
    contype: '1',
    entry: 1,
    qty: 0.2,
    price: 3495.1,
    volume: 2000,
    volumeext: 20000000,
    profit: 111.12,
    commission: -1,
    comment: ' '
  }
];

@Component({
  selector: 'app-deals-live',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule, AgGridAngular],
  templateUrl: './deals-live.component.html',
  styleUrls: ['./deals-live.component.scss']
})
export class DealsLiveComponent implements OnDestroy {
  gridOptions: GridOptions = {
    theme: 'legacy',
    columnDefs: [
      {
        field: 'time',
        headerName: 'Time',
        valueFormatter: p => new Date(p.value).toLocaleTimeString(),
        sort: 'asc'
      },
      { field: 'login', headerName: 'Login' },
      { field: 'deal', headerName: 'Deal' },
      { field: 'symbol', headerName: 'Symbol' },
      { field: 'contype', headerName: 'ConType' },
      { field: 'entry', headerName: 'Entry' },
      { field: 'qty', headerName: 'Qty', type: 'numericColumn' },
      { field: 'price', headerName: 'Price', type: 'numericColumn' },
      { field: 'volume', headerName: 'Volume', type: 'numericColumn' },
      { field: 'volumeext', headerName: 'VolumeExt', type: 'numericColumn' },
      {
        field: 'profit',
        headerName: 'Profit',
        type: 'numericColumn',
        cellClassRules: {
          'text-green-600': p => p.value > 0,
          'text-red-600': p => p.value < 0
        }
      },
      { field: 'commission', headerName: 'Commission', type: 'numericColumn' },
      { field: 'comment', headerName: 'Comment' }
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 110
    },
    rowData: SAMPLE_ROWS,
    rowBuffer: 0,
    rowSelection: 'single',
    animateRows: true,
    getRowId: p => String(p.data.deal)
  };

  private gridApi!: GridApi;
  private sub?: Subscription;
  autoRefresh = false;
  lastMaxTime?: string;
  // Hard-coded date for retrieving sample live deals
  selectedDateParam = '8/8/2025';
  constructor(private svc: DealsService) {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.setGridOption('rowData', SAMPLE_ROWS);
    this.fetchDeals().subscribe();
  }

  onAutoRefreshChange() {
    if (this.autoRefresh) {
      this.sub = interval(1000)
        .pipe(switchMap(() => this.fetchDeals()))
        .subscribe();
    } else {
      this.sub?.unsubscribe();
    }
  }

  private fetchDeals() {
    return this.svc
      .getLiveDeals({
        date: this.selectedDateParam,
        sinceTime: this.lastMaxTime ?? 'NULL',
        pageSize: this.lastMaxTime ? 1000 : 500,
        asc: false,
      })
      .pipe(
        tap(res => {
          if (res.rows?.length) {
            if (this.lastMaxTime) {
              this.gridApi.applyTransaction({ add: res.rows });
            } else {
              this.gridApi.setGridOption('rowData', res.rows);
            }
          }
          if (res.maxTime != null) {
            this.lastMaxTime = res.maxTime;
          }
        })
      );
  }
}
