import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealsService } from '@services/deals.service';
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
        sort: 'desc'
      },
      { field: 'login', headerName: 'Login' },
      { field: 'deal', headerName: 'Deal' },
      { field: 'symbol', headerName: 'Symbol' },
      {
        field: 'contype',
        headerName: 'ConType',
        width: 62,
        minWidth: 62,
        cellClassRules: {
          'contype-buy': p => {
            const c = String(p.value).toUpperCase();
            return c === 'B' || c === '0';
          },
          'contype-sell': p => {
            const c = String(p.value).toUpperCase();
            return c === 'S' || c === '1';
          },
        },
      },
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
      minWidth: 88
    },
    rowData: [],
    rowBuffer: 0,
    rowSelection: 'single',
    animateRows: true,
    getRowId: p => String(p.data.deal)
  };

  private gridApi!: GridApi;
  private sub?: Subscription;
  autoRefresh = false;
  lastMaxTime?: string;
  rowCount = 0;
  selectedDate = new Date().toISOString().substring(0, 10);
  constructor(private svc: DealsService) {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
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

  onDateChange() {
    this.lastMaxTime = undefined;
    this.gridApi.setGridOption('rowData', []);
    this.fetchDeals().subscribe();
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  private fetchDeals() {
    return this.svc
      .getLiveDeals({
        date: new Date(this.selectedDate).toLocaleDateString('en-US'),
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
          if (res.rowCount != null) {
            this.rowCount = res.rowCount;
          }
        })
      );
  }
}
