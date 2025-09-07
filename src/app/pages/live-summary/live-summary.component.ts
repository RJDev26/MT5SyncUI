import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AgGridModule } from 'ag-grid-angular';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';
import { DealsService, LiveSummaryRow } from '@services/deals.service';
import { MasterService, MasterItem } from '@services/master.service';
import { format } from 'date-fns';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-live-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    AgGridModule,
  ],
  templateUrl: './live-summary.component.html',
  styleUrls: ['./live-summary.component.scss'],
})
export class LiveSummaryComponent implements OnInit {
  fromDate = new Date();
  toDate = new Date();
  managerId: number | null = null;
  groupMode: 'symbol' | 'login' = 'symbol';
  managers: MasterItem[] = [];

  gridOptions: GridOptions<LiveSummaryRow> = {
    theme: 'legacy',
    rowHeight: 25,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    columnDefs: [],
    rowData: [],
  };

  private gridApi!: GridApi<LiveSummaryRow>;

  symbolColumnDefs: ColDef[] = [
    { field: 'symbol', headerName: 'Symbol' },
    { field: 'openQty', headerName: 'Open Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'openRate', headerName: 'Open Rate', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'openAmt', headerName: 'Open Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'buyAmt', headerName: 'Buy Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'sellAmt', headerName: 'Sell Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'commission', headerName: 'Commission', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'closeQty', headerName: 'Close Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'closeRate', headerName: 'Close Rate', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'closeAmt', headerName: 'Close Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'grossMTM', headerName: 'Gross MTM', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'netAmt', headerName: 'Net Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
  ];

  loginColumnDefs: ColDef[] = [
    { field: 'login', headerName: 'Login' },
    { field: 'symbol', headerName: 'Symbol' },
    { field: 'openQty', headerName: 'Open Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'openRate', headerName: 'Open Rate', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'openAmt', headerName: 'Open Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'buyAmt', headerName: 'Buy Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'sellAmt', headerName: 'Sell Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'commission', headerName: 'Commission', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'closeQty', headerName: 'Close Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'closeRate', headerName: 'Close Rate', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'closeAmt', headerName: 'Close Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'grossMTM', headerName: 'Gross MTM', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
    { field: 'netAmt', headerName: 'Net Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellStyle: { textAlign: 'right' } },
  ];

  constructor(private deals: DealsService, private master: MasterService) {}

  ngOnInit(): void {
    this.master.getManagers().subscribe(res => (this.managers = res));
    this.gridOptions.columnDefs = this.symbolColumnDefs;
  }

  onGridReady(event: GridReadyEvent<LiveSummaryRow>) {
    this.gridApi = event.api;
  }

  show() {
    const from = format(this.fromDate, 'yyyy-MM-dd');
    const to = format(this.toDate, 'yyyy-MM-dd');
    this.deals
      .getLiveSummary(from, to, this.managerId ?? undefined)
      .subscribe(res => {
        let rows = res.rows.map(r => ({
          ...r,
          openQty: Number(r.openQty),
          openRate: Number(r.openRate),
          openAmt: Number(r.openAmt),
          buyQty: Number(r.buyQty),
          buyAmt: Number(r.buyAmt),
          sellQty: Number(r.sellQty),
          sellAmt: Number(r.sellAmt),
          commission: Number(r.commission),
          closeQty: Number(r.closeQty),
          closeRate: Number(r.closeRate),
          closeAmt: Number(r.closeAmt),
          grossMTM: Number(r.grossMTM),
          netAmt: Number(r.netAmt),
        }));
        if (this.groupMode === 'symbol') {
          rows = this.groupBySymbol(rows);
          this.gridApi.setGridOption('columnDefs', this.symbolColumnDefs);
        } else {
          this.gridApi.setGridOption('columnDefs', this.loginColumnDefs);
        }
        this.gridApi.setGridOption('rowData', rows);
        this.gridApi.sizeColumnsToFit();
      });
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv({ fileName: 'LiveSummary' });
  }

  private groupBySymbol(rows: LiveSummaryRow[]): LiveSummaryRow[] {
    const groups: Record<string, LiveSummaryRow[]> = {};
    rows.forEach(r => {
      const key = r.symbol;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    const result: LiveSummaryRow[] = [];
    for (const [symbol, list] of Object.entries(groups)) {
      const agg: LiveSummaryRow = {
        symbol,
        openQty: 0,
        openRate: 0,
        openAmt: 0,
        buyQty: 0,
        buyAmt: 0,
        sellQty: 0,
        sellAmt: 0,
        commission: 0,
        closeQty: 0,
        closeRate: 0,
        closeAmt: 0,
        grossMTM: 0,
        netAmt: 0,
      };
      list.forEach(r => {
        agg.openQty += Number(r.openQty);
        agg.openAmt += Number(r.openAmt);
        agg.buyQty += Number(r.buyQty);
        agg.buyAmt += Number(r.buyAmt);
        agg.sellQty += Number(r.sellQty);
        agg.sellAmt += Number(r.sellAmt);
        agg.commission += Number(r.commission);
        agg.closeQty += Number(r.closeQty);
        agg.closeAmt += Number(r.closeAmt);
        agg.grossMTM += Number(r.grossMTM);
        agg.netAmt += Number(r.netAmt);
      });
      agg.openRate = agg.openQty ? agg.openAmt / agg.openQty : 0;
      agg.closeRate = agg.closeQty ? agg.closeAmt / agg.closeQty : 0;
      result.push(agg);
    }
    return result;
  }

  formatNumber(value: any): string {
    const num = Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }
}

