import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DealsService, OrderRow } from '@services/deals.service';
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
  selector: 'app-live-orders',
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
  templateUrl: './live-orders.component.html',
  styleUrls: ['./live-orders.component.scss'],
})
export class LiveOrdersComponent implements OnDestroy {
  gridOptions: GridOptions = {
    theme: 'legacy',
    columnDefs: [
      {
        field: 'time',
        headerName: 'Time',
        valueFormatter: p =>
          new Date(p.value).toLocaleTimeString('en-GB', { hour12: false }),
        sort: 'desc',
      },
      { field: 'login', headerName: 'Login' },
      { field: 'order', headerName: 'Order' },
      { field: 'symbol', headerName: 'Symbol' },
      { field: 'qty', headerName: 'Qty', type: 'numericColumn' },
      { field: 'price', headerName: 'Price', type: 'numericColumn' },
      { field: 'orderTypeName', headerName: 'OrderTypeName' },
      { field: 'lastIP', headerName: 'LastIP' },
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 88,
    },
    rowClassRules: {
      'row-buy': p => {
        const name = String(p.data?.orderTypeName || '')
          .trim()
          .toUpperCase();
        const type = Number(p.data?.orderType);
        return name === 'BUYLIMIT' || name === 'BUYSTOP' || [2, 4].includes(type);
      },
      'row-sell': p => {
        const name = String(p.data?.orderTypeName || '')
          .trim()
          .toUpperCase();
        const type = Number(p.data?.orderType);
        return name === 'SELLLIMIT' || name === 'SELLSTOP' || [3, 5].includes(type);
      },
    },
    // Match row height with the deals-live grid for visual consistency
    rowHeight: 26,
    rowSelection: 'single',
    animateRows: true,
    getRowId: p => String(p.data.order),
  };

  rowData: OrderRow[] = [];

  autoRefresh = false;
  lastMaxTime?: string;
  rowCount = 0;
  private refreshSub?: Subscription;
  private gridApi!: GridApi<OrderRow>;

  constructor(private svc: DealsService) {}

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.loadData();
  }

  onAutoRefreshChange() {
    this.refreshSub?.unsubscribe();
    if (this.autoRefresh) {
      this.refreshSub = interval(5000).subscribe(() => this.loadData());
    }
  }

  loadData() {
    this.svc.getOrdersSnapshot().subscribe(res => {
      this.rowData = res.rows;
      this.lastMaxTime = res.maxTime || undefined;
      this.rowCount = res.rowCount;
    });
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  exportCsv() {
    const dateStr = new Date().toISOString().split('T')[0];
    this.gridApi.exportDataAsCsv({ fileName: `Order-${dateStr}.csv` });
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
    doc.save(`Order-${dateStr}.pdf`);
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }
}
