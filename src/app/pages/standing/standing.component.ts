import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgGridModule } from 'ag-grid-angular';
import {
  GridApi,
  GridOptions,
  ColDef,
  ModuleRegistry,
  RowGroupingModule,
  ClientSideRowModelModule,
} from 'ag-grid-community';
import { DealsService, StandingRow } from '@services/deals.service';
import { MasterService, MasterItem, LoginOption } from '@services/master.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

interface StandingGridRow extends StandingRow {
  diffQty: number;
}

@Component({
  selector: 'app-standing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    AgGridModule,
  ],
  templateUrl: './standing.component.html',
  styleUrls: ['./standing.component.scss'],
})
export class StandingComponent implements OnInit {
  selectedDate: Date = new Date();
  logins: LoginOption[] = [];
  symbols: MasterItem[] = [];
  selectedLogin: number | null = null;
  selectedSymbol: string | null = null;
  groupBy: 'date' | 'login' | 'symbol' = 'date';
  private rows: StandingGridRow[] = [];

  dateColumnDefs: ColDef<StandingGridRow>[] = [
    {
      field: 'tradeDate',
      headerName: 'Trade Date',
      rowGroup: true,
      hide: true,
      valueFormatter: p => new Date(p.value).toLocaleDateString('en-GB'),
    },
    { field: 'login', headerName: 'Login' },
    { field: 'symbol', headerName: 'Symbol' },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn', aggFunc: 'sum' },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn', aggFunc: 'sum' },
    { field: 'diffQty', headerName: 'Diff Qty', type: 'numericColumn', aggFunc: 'sum' },
  ];

  loginColumnDefs: ColDef<StandingGridRow>[] = [
    { field: 'login', headerName: 'Login', rowGroup: true, hide: true },
    {
      field: 'tradeDate',
      headerName: 'Trade Date',
      valueFormatter: p => new Date(p.value).toLocaleDateString('en-GB'),
    },
    { field: 'symbol', headerName: 'Symbol' },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn', aggFunc: 'sum' },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn', aggFunc: 'sum' },
    { field: 'diffQty', headerName: 'Diff Qty', type: 'numericColumn', aggFunc: 'sum' },
  ];

  symbolColumnDefs: ColDef<StandingGridRow>[] = [
    { field: 'symbol', headerName: 'Symbol', rowGroup: true, hide: true },
    {
      field: 'tradeDate',
      headerName: 'Trade Date',
      valueFormatter: p => new Date(p.value).toLocaleDateString('en-GB'),
    },
    { field: 'login', headerName: 'Login' },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn', aggFunc: 'sum' },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn', aggFunc: 'sum' },
    { field: 'diffQty', headerName: 'Diff Qty', type: 'numericColumn', aggFunc: 'sum' },
  ];

  columnDefs: ColDef<StandingGridRow>[] = [...this.dateColumnDefs];

  gridOptions: GridOptions<StandingGridRow> = {
    theme: 'legacy',
    columnDefs: this.columnDefs,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 100,
      flex: 1,
    },
    autoGroupColumnDef: { headerName: 'Trade Date' },
    rowData: [],
    pagination: true,
    paginationPageSize: 25,
    paginationPageSizeSelector: [10, 25, 50, 100],
    groupIncludeFooter: true,
    groupIncludeTotalFooter: true,
    groupDefaultExpanded: -1,
  };

  private gridApi!: GridApi<StandingGridRow>;

  constructor(private deals: DealsService, private master: MasterService) {}

  ngOnInit(): void {
    this.master.getLogins().subscribe(res => (this.logins = res));
    this.master.getSymbols().subscribe(res => (this.symbols = res));
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.updateColumnDefs();
  }

  onShow() {
    const dateStr = this.selectedDate.toISOString().split('T')[0].replace(/-/g, '/');
    this.deals
      .getStanding(dateStr, this.selectedLogin, this.selectedSymbol)
      .subscribe(res => {
        const rows: StandingGridRow[] = res.rows.map(r => ({
          ...r,
          diffQty: (r.buyQty || 0) - (r.sellQty || 0),
        }));
        this.rows = rows;
        this.gridApi.setGridOption('rowData', rows);
      });
  }

  onGroupChange() {
    this.updateColumnDefs();
    this.gridApi.setGridOption('rowData', this.rows);
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv({ fileName: 'standing.csv' });
  }

  exportPdf() {
    const cols = this.columnDefs.map(c => c.headerName as string);
    const rows: any[] = [];
    this.gridApi.forEachNode(n => {
      const data = n.data as StandingGridRow;
      rows.push([
        data.tradeDate,
        data.login,
        data.symbol,
        data.buyQty,
        data.sellQty,
        data.diffQty,
      ]);
    });
    const doc = new jsPDF();
    (autoTable as any)(doc, { head: [cols], body: rows });
    doc.save('standing.pdf');
  }

  private updateColumnDefs() {
    const defs =
      this.groupBy === 'date'
        ? this.dateColumnDefs
        : this.groupBy === 'login'
        ? this.loginColumnDefs
        : this.symbolColumnDefs;
    const groupHeader =
      this.groupBy === 'date'
        ? {
            headerName: 'Trade Date',
            valueFormatter: (p: any) => new Date(p.value).toLocaleDateString('en-GB'),
          }
        : this.groupBy === 'login'
        ? { headerName: 'Login' }
        : { headerName: 'Symbol' };
    this.columnDefs = defs;
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', defs);
      this.gridApi.setGridOption('autoGroupColumnDef', groupHeader);
      setTimeout(() => {
        this.gridApi.refreshClientSideRowModel('group');
        this.gridApi.sizeColumnsToFit();
      }, 0);
    }
  }
}
