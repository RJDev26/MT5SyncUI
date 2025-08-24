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
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
} from 'ag-grid-community';
import { DealsService, StandingRow } from '@services/deals.service';
import { MasterService, MasterItem, LoginOption } from '@services/master.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ModuleRegistry.registerModules([AllCommunityModule]);

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

  baseColumnDefs: ColDef<StandingGridRow>[] = [
    {
      field: 'tradeDate',
      headerName: 'Trade Date',
      valueFormatter: p => new Date(p.value).toLocaleDateString('en-GB'),
    },
    { field: 'login', headerName: 'Login' },
    { field: 'symbol', headerName: 'Symbol' },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn', aggFunc: 'sum' },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn', aggFunc: 'sum' },
    { field: 'diffQty', headerName: 'Diff Qty', type: 'numericColumn', aggFunc: 'sum' },
  ];

  gridOptions: GridOptions<StandingGridRow> = {
    theme: 'legacy',
    groupDisplayType: 'groupRows',
    groupDefaultExpanded: -1,
    columnDefs: this.baseColumnDefs,
    autoGroupColumnDef: {
      headerName: '',
      cellRendererParams: { suppressCount: true },
      flex: 1,
    },
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 100,
      flex: 1,
    },
    rowData: [],
  };

  private gridApi!: GridApi<StandingGridRow>;

  constructor(private deals: DealsService, private master: MasterService) {}

  ngOnInit(): void {
    this.master.getLogins().subscribe(res => (this.logins = res));
    this.master.getSymbols().subscribe(res => (this.symbols = res));
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.applyGrouping();
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
        this.gridApi.setGridOption('rowData', rows);
        this.gridApi.refreshClientSideRowModel('group');
      });
  }

  onGroupChange() {
    this.applyGrouping();
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv({ fileName: 'standing.csv' });
  }

  exportPdf() {
    const cols = this.baseColumnDefs.map(c => c.headerName as string);
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

  private applyGrouping() {
    if (!this.gridApi) return;
    const groupField =
      this.groupBy === 'date'
        ? 'tradeDate'
        : this.groupBy === 'login'
        ? 'login'
        : 'symbol';
    const colDefs = this.baseColumnDefs.map(col => ({
      ...col,
      rowGroup: col.field === groupField,
      hide: col.field === groupField,
    }));
    this.gridApi.setGridOption('columnDefs', colDefs);
    this.gridApi.refreshClientSideRowModel('group');
  }
}
