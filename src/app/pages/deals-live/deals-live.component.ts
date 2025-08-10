import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealsService } from '@services/deals.service';
import { GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AgGridModule, AgGridAngular } from 'ag-grid-angular';
import { interval, Subscription, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-deals-live',
  standalone: true,
  imports: [CommonModule, AgGridModule, AgGridAngular],
  templateUrl: './deals-live.component.html',
  styleUrls: ['./deals-live.component.scss']
})
export class DealsLiveComponent implements OnInit, OnDestroy {
  gridOptions: GridOptions = {
    columnDefs: [
      { field: 'Time', valueFormatter: p => new Date(p.value).toLocaleTimeString(), sort: 'asc' },
      { field: 'Login' },
      { field: 'Deal' },
      { field: 'Symbol' },
      { field: 'ConType' },
      { field: 'Entry' },
      { field: 'Qty', type: 'numericColumn' },
      { field: 'Price', type: 'numericColumn' },
      { field: 'Volume', type: 'numericColumn' },
      { field: 'VolumeExt', type: 'numericColumn' },
      {
        field: 'Profit', type: 'numericColumn',
        cellClassRules: {
          'text-green-600': p => p.value > 0,
          'text-red-600': p => p.value < 0
        }
      },
      { field: 'Commission', type: 'numericColumn' },
      { field: 'Comment' }
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 110
    },
    rowBuffer: 0,
    rowSelection: 'single',
    animateRows: true,
    getRowId: p => String(p.data.Deal)
  };

  private gridApi!: GridApi;
  private sub?: Subscription;
  lastMaxTime?: string;
  selectedDateParam = new Date().toLocaleDateString('en-US');

  constructor(private svc: DealsService) {}

  ngOnInit(): void {
    this.sub = interval(1000).pipe(
      startWith(0),
      switchMap(() =>
        this.svc.getLiveDeals({
          date: this.selectedDateParam,
          sinceTime: this.lastMaxTime ?? undefined,
          pageSize: this.lastMaxTime ? 1000 : 500,
          asc: false,
        })
      ),
      tap(res => {
        if (res.rows?.length) {
          this.gridApi.applyTransaction({ add: res.rows });
        }
        if (res.maxTime) this.lastMaxTime = res.maxTime;
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
  }
}
