import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DealsService, JobbingDealRow } from '@services/deals.service';
import { interval, Subscription } from 'rxjs';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';
import { AgGridModule, AgGridAngular } from 'ag-grid-angular';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-jobbing-deals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    AgGridModule,
    AgGridAngular,
  ],
  templateUrl: './jobbing-deals.component.html',
  styleUrls: ['./jobbing-deals.component.scss'],
})
export class JobbingDealsComponent implements OnDestroy {
  gridOptions: GridOptions = {
    theme: 'legacy',
    columnDefs: [
      { field: 'login', headerName: 'Login' },
      { field: 'symbol', headerName: 'Symbol' },
      { field: 'dateString', headerName: 'Date' },
      {
        field: 'buyTime',
        headerName: 'Buy Time',
        valueFormatter: p => this.formatTime(p.value),
      },
      {
        field: 'sellTime',
        headerName: 'Sell Time',
        valueFormatter: p => this.formatTime(p.value),
      },
      { field: 'diffSec', headerName: 'DiffSec', type: 'numericColumn' },
      { field: 'bQty', headerName: 'B Qty', type: 'numericColumn' },
      { field: 'sQty', headerName: 'S Qty', type: 'numericColumn' },
      { field: 'buyPrice', headerName: 'Buy Price', type: 'numericColumn' },
      { field: 'sellPrice', headerName: 'Sell Price', type: 'numericColumn' },
      { field: 'priceDiff', headerName: 'Price Diff', type: 'numericColumn' },
      { field: 'mtm', headerName: 'MTM', type: 'numericColumn' },
      { field: 'buyDeal', headerName: 'Buy Deal' },
      { field: 'sellDeal', headerName: 'Sell Deal' },
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 88,
      flex: 1,
    },
    rowData: [],
    // Align row height with deals-live grid
    rowHeight: 34,
    rowSelection: 'single',
    animateRows: true,
    getRowId: p => String(p.data.buyDeal) + '-' + String(p.data.sellDeal),
  };

  intervalMinutes = 5;
  autoRefresh = false;
  lastMaxTime?: string;
  rowCount = 0;
  private refreshSub?: Subscription;
  private gridApi!: GridApi<JobbingDealRow>;

  constructor(private svc: DealsService) {}

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.loadData();
  }

  onAutoRefreshChange() {
    this.refreshSub?.unsubscribe();
    if (this.autoRefresh) {
      this.refreshSub = interval(5000).subscribe(() => this.loadData());
      this.loadData();
    }
  }

  loadData() {
    const today = new Date();
    const from = this.formatDate(today);
    const to = this.formatDate(today);
    this.svc
      .getJobbingDeals(from, to, this.intervalMinutes)
      .subscribe(res => {
        this.gridApi.setGridOption('rowData', res.rows);
        setTimeout(() => this.gridApi.sizeColumnsToFit());
        this.lastMaxTime = res.maxTime || undefined;
        this.rowCount = res.rowCount;
      });
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  private formatTime(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  exportCsv() {
    const dateStr = new Date().toISOString().split('T')[0];
    this.gridApi.exportDataAsCsv({ fileName: `live-jobbing-${dateStr}.csv` });
  }

  exportPdf() {
    const dateStr = new Date().toISOString().split('T')[0];
    const cols = (this.gridOptions.columnDefs || []).map(c => (c as any).headerName);
    const rows: any[] = [];
    this.gridApi.forEachNode(n => {
      const row = n.data as Record<string, unknown> | undefined;
      if (row) {
        rows.push((this.gridOptions.columnDefs || []).map(c => row[(c as any).field]));
      }
    });
    const doc = new jsPDF();
    (autoTable as any)(doc, { head: [cols], body: rows });
    doc.save(`live-jobbing-${dateStr}.pdf`);
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }
}
