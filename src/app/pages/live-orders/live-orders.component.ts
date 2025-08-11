import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, AgGridModule, AgGridAngular],
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
        valueFormatter: p => new Date(p.value).toLocaleTimeString(),
        sort: 'desc',
      },
      { field: 'login', headerName: 'Login' },
      { field: 'order', headerName: 'Order' },
      { field: 'symbol', headerName: 'Symbol' },
      { field: 'qty', headerName: 'Qty', type: 'numericColumn' },
      { field: 'price', headerName: 'Price', type: 'numericColumn' },
      { field: 'volume', headerName: 'Volume', type: 'numericColumn' },
      { field: 'orderType', headerName: 'OrderType', type: 'numericColumn' },
      { field: 'orderTypeName', headerName: 'OrderTypeName' },
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 88,
    },
    rowData: [],
    rowHeight: 32,
    rowSelection: 'single',
    animateRows: true,
    getRowId: p => String(p.data.order),
  };

  autoRefresh = false;
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
    this.svc.getOrdersSnapshot().subscribe(rows => {
      this.gridApi.setGridOption('rowData', rows);
    });
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  exportCsv() {
    const dateStr = new Date().toISOString().split('T')[0];
    this.gridApi.exportDataAsCsv({ fileName: `Deals-${dateStr}.csv` });
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
    doc.save(`Deals-${dateStr}.pdf`);
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }
}
