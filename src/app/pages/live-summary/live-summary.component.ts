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
  groupMode: 'SymbolWise' | 'LoginWise' | 'Detail' = 'SymbolWise';
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
    pagination: true,
    paginationPageSize: 100,
    paginationPageSizeSelector: [50, 100, 200],
  };

  private gridApi!: GridApi<LiveSummaryRow>;

  symbolColumnDefs: ColDef[] = [
    { field: 'symbol', headerName: 'Symbol' },
    { field: 'openQty', headerName: 'Open Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'openRate', headerName: 'Open Rate', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: 'ag-right-aligned-cell' },
    { field: 'openAmt', headerName: 'Open Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'buyAmt', headerName: 'Buy Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'sellAmt', headerName: 'Sell Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'closeQty', headerName: 'Close Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'closeRate', headerName: 'Close Rate', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: 'ag-right-aligned-cell' },
    { field: 'closeAmt', headerName: 'Close Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'grossMTM', headerName: 'Gross MTM', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'netAmt', headerName: 'Net Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
  ];

  loginColumnDefs: ColDef[] = [
    { field: 'login', headerName: 'Login' },
    { field: 'openQty', headerName: 'Open Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'openRate', headerName: 'Open Rate', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: 'ag-right-aligned-cell' },
    { field: 'openAmt', headerName: 'Open Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'buyAmt', headerName: 'Buy Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'sellAmt', headerName: 'Sell Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'closeQty', headerName: 'Close Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'closeRate', headerName: 'Close Rate', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: 'ag-right-aligned-cell' },
    { field: 'closeAmt', headerName: 'Close Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'grossMTM', headerName: 'Gross MTM', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'netAmt', headerName: 'Net Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
  ];

  detailColumnDefs: ColDef[] = [
    { field: 'login', headerName: 'Login' },
    { field: 'symbol', headerName: 'Symbol' },
    { field: 'openQty', headerName: 'Open Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'openRate', headerName: 'Open Rate', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: 'ag-right-aligned-cell' },
    { field: 'openAmt', headerName: 'Open Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'buyAmt', headerName: 'Buy Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'sellAmt', headerName: 'Sell Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'closeQty', headerName: 'Close Qty', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'closeRate', headerName: 'Close Rate', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: 'ag-right-aligned-cell' },
    { field: 'closeAmt', headerName: 'Close Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'grossMTM', headerName: 'Gross MTM', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
    { field: 'netAmt', headerName: 'Net Amt', type: 'numericColumn', valueFormatter: p => this.formatNumber(p.value), cellClass: p => this.numericCellClass(p) },
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
    this.gridApi.setGridOption('loading', true);
    this.deals
      .getLiveSummary(from, to, this.managerId ?? undefined, this.groupMode)
      .subscribe({
        next: res => {
          const rows = res.rows.map(r => ({
            ...r,
            openQty: Number(r.openQty),
            openRate: Number(r.openRate),
            openAmt: Number(r.openAmt),
            buyQty: Number(r.buyQty),
            buyAmt: Number(r.buyAmt),
            sellQty: Number(r.sellQty),
            sellAmt: Number(r.sellAmt),
            closeQty: Number(r.closeQty),
            closeRate: Number(r.closeRate),
            closeAmt: Number(r.closeAmt),
            grossMTM: Number(r.grossMTM),
            netAmt: Number(r.netAmt),
          }));
          if (this.groupMode === 'SymbolWise') {
            this.gridApi.setGridOption('columnDefs', this.symbolColumnDefs);
          } else if (this.groupMode === 'LoginWise') {
            this.gridApi.setGridOption('columnDefs', this.loginColumnDefs);
          } else {
            this.gridApi.setGridOption('columnDefs', this.detailColumnDefs);
          }
          this.gridApi.setGridOption('rowData', rows);
          this.gridApi.sizeColumnsToFit();
        },
        error: () => {
          this.gridApi.setGridOption('loading', false);
        },
        complete: () => {
          this.gridApi.setGridOption('loading', false);
        },
      });
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv({ fileName: 'LiveSummary' });
  }

  formatNumber(value: any): string {
    const num = Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }

  numericCellClass(params: any): string[] {
    const val = Number(params.value);
    return ['ag-right-aligned-cell', val < 0 ? 'negative' : val > 0 ? 'positive' : ''];
  }
}

