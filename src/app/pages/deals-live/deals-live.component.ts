import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-deals-live',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    AgGridModule,
    AgGridAngular,
  ],
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
        valueFormatter: p =>
          new Date(p.value).toLocaleTimeString('en-GB', {
            hour12: false,
          }),
        sort: 'desc',
        width: 53,
        minWidth: 53
      },
      { field: 'login', headerName: 'Login', width: 53, minWidth: 53 },
      { field: 'deal', headerName: 'Deal', width: 53, minWidth: 53 },
      { field: 'symbol', headerName: 'Symbol' },
      { field: 'contype', headerName: 'ConType', width: 62, minWidth: 62 },
      { field: 'qty', headerName: 'Qty', type: 'numericColumn', width: 53, minWidth: 53 },
      { field: 'price', headerName: 'Price', type: 'numericColumn' },
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
      { field: 'comment', headerName: 'Comment' },
      { field: 'lastIP', headerName: 'LastIP' }
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 88
    },
    rowData: [],
    rowHeight: 26,
    rowBuffer: 0,
    rowSelection: 'single',
    animateRows: true,
    getRowId: p => String(p.data.deal),
    rowClassRules: {
      'row-buy': params => {
        const c = String(params.data?.contype).toUpperCase();
        return c === 'B' || c === '0';
      },
      'row-sell': params => {
        const c = String(params.data?.contype).toUpperCase();
        return c === 'S' || c === '1';
      }
    }
  };

  private gridApi!: GridApi;
  private sub?: Subscription;
  autoRefresh = false;
  lastMaxTime?: string;
  rowCount = 0;
  selectedDate: Date = new Date();
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

  exportCsv() {
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    this.gridApi.exportDataAsCsv({ fileName: `Deal-${dateStr}.csv` });
  }

  exportPdf() {
    const cols = (this.gridOptions.columnDefs || []).map(c => (c as any).headerName);
    const rows: any[] = [];
    this.gridApi.forEachNode(n => rows.push((this.gridOptions.columnDefs || []).map(c => n.data[(c as any).field])));
    const doc = new jsPDF();
    (autoTable as any)(doc, { head: [cols], body: rows });
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    doc.save(`Deal-${dateStr}.pdf`);
  }

  private fetchDeals() {
    return this.svc
      .getLiveDeals({
        date: this.selectedDate.toLocaleDateString('en-US'),
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
