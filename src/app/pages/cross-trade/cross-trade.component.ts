import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { AgGridModule, AgGridAngular } from 'ag-grid-angular';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  ColGroupDef,
} from 'ag-grid-community';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  CrossTradeDetailRow,
  CrossTradeSummaryRow,
  DealsService,
} from '@services/deals.service';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-cross-trade',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    AgGridModule,
    AgGridAngular,
  ],
  templateUrl: './cross-trade.component.html',
  styleUrls: ['./cross-trade.component.scss'],
})
export class CrossTradeComponent implements OnInit {
  fromDate = new Date();
  toDate = new Date();
  searchText = '';
  activeTab: 'summary' | 'detail' = 'summary';

  summaryRows: CrossTradeSummaryRow[] = [];
  detailRows: CrossTradeDetailRow[] = [];

  summaryGridOptions: GridOptions<CrossTradeSummaryRow> = {
    theme: 'legacy',
    rowHeight: 32,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 110,
      flex: 1,
    },
    columnDefs: [
      { field: 'symbol', headerName: 'Symbol' },
      { field: 'lastIP', headerName: 'Last IP' },
      { field: 'login1', headerName: 'Login 1', type: 'numericColumn' },
      { field: 'login2', headerName: 'Login 2', type: 'numericColumn' },
      {
        field: 'firstTradeTime',
        headerName: 'First Trade Time',
        valueFormatter: params => this.formatDateTime(params.value),
      },
      {
        field: 'lastTradeTime',
        headerName: 'Last Trade Time',
        valueFormatter: params => this.formatDateTime(params.value),
      },
      { field: 'deals', headerName: 'Deals', type: 'numericColumn' },
      { field: 'bDeals', headerName: 'B Deals', type: 'numericColumn' },
      { field: 'sDeals', headerName: 'S Deals', type: 'numericColumn' },
    ],
    rowData: [],
    animateRows: true,
    suppressCellFocus: true,
  };

  detailGridOptions: GridOptions<CrossTradeDetailRow> = {
    theme: 'legacy',
    rowHeight: 32,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 110,
      flex: 1,
    },
    columnDefs: [
      { field: 'symbol', headerName: 'Symbol' },
      { field: 'lastIP', headerName: 'Last IP' },
      { field: 'login1', headerName: 'Login 1', type: 'numericColumn' },
      { field: 'login2', headerName: 'Login 2', type: 'numericColumn' },
      { field: 'rowSide', headerName: 'Side' },
      { field: 'login', headerName: 'Login', type: 'numericColumn' },
      {
        field: 'time',
        headerName: 'Time',
        valueFormatter: params => this.formatDateTime(params.value),
      },
      { field: 'deal', headerName: 'Deal', type: 'numericColumn' },
      { field: 'conType', headerName: 'Con Type' },
      { field: 'qty', headerName: 'Qty', type: 'numericColumn' },
      { field: 'price', headerName: 'Price', type: 'numericColumn' },
      { field: 'volume', headerName: 'Volume', type: 'numericColumn' },
      { field: 'volumeext', headerName: 'Volume Ext', type: 'numericColumn' },
      { field: 'profit', headerName: 'Profit', type: 'numericColumn' },
      { field: 'commission', headerName: 'Commission', type: 'numericColumn' },
      { field: 'comment', headerName: 'Comment' },
    ],
    rowData: [],
    animateRows: true,
    suppressCellFocus: true,
  };

  private summaryGridApi?: GridApi<CrossTradeSummaryRow>;
  private detailGridApi?: GridApi<CrossTradeDetailRow>;

  constructor(private deals: DealsService) {}

  ngOnInit(): void {
    this.show();
  }

  onSummaryGridReady(event: GridReadyEvent<CrossTradeSummaryRow>) {
    this.summaryGridApi = event.api;
    this.refreshSummaryGrid();
  }

  onDetailGridReady(event: GridReadyEvent<CrossTradeDetailRow>) {
    this.detailGridApi = event.api;
    this.refreshDetailGrid();
  }

  show() {
    if (!this.fromDate || !this.toDate) {
      this.summaryRows = [];
      this.detailRows = [];
      this.refreshSummaryGrid();
      this.refreshDetailGrid();
      return;
    }

    const from = this.formatDate(this.fromDate);
    const to = this.formatDate(this.toDate);

    this.summaryGridApi?.showLoadingOverlay();
    this.detailGridApi?.showLoadingOverlay();

    this.deals.getCrossTradePairs(from, to).subscribe({
      next: res => {
        this.summaryRows = res.rows ?? [];
        this.detailRows = res.details ?? [];

        this.refreshSummaryGrid();
        this.refreshDetailGrid();
      },
      error: () => {
        this.summaryGridApi?.hideOverlay();
        this.detailGridApi?.hideOverlay();
      },
    });
  }

  onSearchChange(value: string) {
    this.searchText = value;
    this.applyQuickFilter(value);
  }

  onTabChange(index: number) {
    this.activeTab = index === 0 ? 'summary' : 'detail';
    this.applyQuickFilter(this.searchText);
  }

  exportCsv() {
    const api = this.getActiveGridApi();
    if (!api) {
      return;
    }
    const suffix = this.activeTab === 'summary' ? 'summary' : 'detail';
    api.exportDataAsCsv({ fileName: `cross-trade-${suffix}.csv` });
  }

  exportPdf() {
    const api = this.getActiveGridApi();
    if (!api) {
      return;
    }

    const columnDefs = this.flattenColumnDefs(
      ((api.getColumnDefs() ?? []) as AnyColumnDef[])
    );
    const headers = columnDefs.map(col =>
      col.headerName ?? (typeof col.field === 'string' ? col.field : '')
    );

    const rows: string[][] = [];
    api.forEachNode(node => {
      const data: string[] = [];
      columnDefs.forEach(col => {
        const field = typeof col.field === 'string' ? col.field : '';
        if (!field) {
          data.push('');
          return;
        }
        data.push(this.formatExportValue(field, (node.data as any)?.[field]));
      });
      rows.push(data);
    });

    const doc = new jsPDF();
    (autoTable as any)(doc, { head: [headers], body: rows });
    const suffix = this.activeTab === 'summary' ? 'summary' : 'detail';
    doc.save(`cross-trade-${suffix}.pdf`);
  }

  private getActiveGridApi():
    | GridApi<CrossTradeSummaryRow>
    | GridApi<CrossTradeDetailRow>
    | undefined {
    return this.activeTab === 'summary' ? this.summaryGridApi : this.detailGridApi;
  }

  private applyQuickFilter(value: string) {
    this.setQuickFilter(this.summaryGridApi, value);
    this.setQuickFilter(this.detailGridApi, value);
  }

  private refreshSummaryGrid() {
    if (!this.summaryGridApi) {
      return;
    }
    this.setRowData(this.summaryGridApi, this.summaryRows);
    this.setQuickFilter(this.summaryGridApi, this.searchText);
    if (this.summaryRows.length) {
      this.summaryGridApi.hideOverlay();
      setTimeout(() => this.summaryGridApi?.sizeColumnsToFit());
    } else {
      this.summaryGridApi.showNoRowsOverlay();
    }
  }

  private refreshDetailGrid() {
    if (!this.detailGridApi) {
      return;
    }
    this.setRowData(this.detailGridApi, this.detailRows);
    this.setQuickFilter(this.detailGridApi, this.searchText);
    if (this.detailRows.length) {
      this.detailGridApi.hideOverlay();
      setTimeout(() => this.detailGridApi?.sizeColumnsToFit());
    } else {
      this.detailGridApi.showNoRowsOverlay();
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  formatDateTime(value: unknown): string {
    if (!value) {
      return '';
    }
    const date = new Date(value as string);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  private formatExportValue(field: string, value: unknown): string {
    if (!field) {
      return value == null ? '' : String(value);
    }
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (typeof value === 'string') {
      if (field.toLowerCase().includes('time')) {
        return this.formatDateTime(value);
      }
      return value.trim();
    }
    return String(value);
  }

  private flattenColumnDefs(columnDefs: AnyColumnDef[]): ColDef<any>[] {
    const leaves: ColDef<any>[] = [];

    columnDefs.forEach(col => {
      if (this.isGroupColumnDef(col)) {
        leaves.push(
          ...this.flattenColumnDefs((col.children ?? []) as AnyColumnDef[])
        );
      } else {
        leaves.push(col as ColDef<any>);
      }
    });

    return leaves;
  }

  private isGroupColumnDef(col: AnyColumnDef): col is ColGroupDef<any> {
    return Array.isArray((col as ColGroupDef<any>).children);
  }

  private setQuickFilter<T>(api: GridApi<T> | undefined, value: string) {
    if (!api) {
      return;
    }

    const quickFilterApi = api as QuickFilterCapableApi;
    if (typeof quickFilterApi.setQuickFilter === 'function') {
      quickFilterApi.setQuickFilter(value);
    } else if (typeof quickFilterApi.setGridOption === 'function') {
      quickFilterApi.setGridOption('quickFilterText', value);
    }
  }

  private setRowData<T>(api: GridApi<T> | undefined, rows: T[]) {
    if (!api) {
      return;
    }

    const rowDataApi = api as RowDataCapableApi<T>;
    if (typeof rowDataApi.setRowData === 'function') {
      rowDataApi.setRowData(rows);
    } else if (typeof rowDataApi.setGridOption === 'function') {
      rowDataApi.setGridOption('rowData', rows);
    }
  }
}

type AnyColumnDef = ColDef<any> | ColGroupDef<any>;
type QuickFilterCapableApi = GridApi<any> & {
  setQuickFilter?: (quickFilter: string) => void;
  setGridOption?: (key: string, value: any) => void;
};
type RowDataCapableApi<T> = GridApi<T> & {
  setRowData?: (rowData: T[]) => void;
  setGridOption?: (key: string, value: any) => void;
};
