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
  ICellRendererParams,
} from 'ag-grid-community';
import { DealsService, StandingRow } from '@services/deals.service';
import { MasterService, MasterItem, LoginOption } from '@services/master.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ModuleRegistry.registerModules([AllCommunityModule]);

interface StandingGridRow extends StandingRow {
  diffQty: number;
  isGroupHeader?: boolean;
  isGroupTotal?: boolean;
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

  groupColSpan = (params: ICellRendererParams<StandingGridRow>): number => {
    if (params.data?.isGroupHeader) {
      const defs = this.gridApi?.getColumnDefs();
      return defs ? defs.length : this.columnDefs.length;
    }
    return 1;
  };

  dateColumnDefs: ColDef<StandingGridRow>[] = [
    {
      field: 'tradeDate',
      headerName: 'Trade Date',
      valueFormatter: p => new Date(p.value).toLocaleDateString('en-GB'),
      colSpan: this.groupColSpan,
    },
    { field: 'login', headerName: 'Login' },
    { field: 'symbol', headerName: 'Symbol' },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn' },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn' },
    { field: 'diffQty', headerName: 'Diff Qty', type: 'numericColumn' },
  ];

  loginColumnDefs: ColDef<StandingGridRow>[] = [
    { field: 'login', headerName: 'Login', colSpan: this.groupColSpan },
    {
      field: 'tradeDate',
      headerName: 'Trade Date',
      valueFormatter: p => new Date(p.value).toLocaleDateString('en-GB'),
    },
    { field: 'symbol', headerName: 'Symbol' },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn' },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn' },
    { field: 'diffQty', headerName: 'Diff Qty', type: 'numericColumn' },
  ];

  symbolColumnDefs: ColDef<StandingGridRow>[] = [
    { field: 'symbol', headerName: 'Symbol', colSpan: this.groupColSpan },
    {
      field: 'tradeDate',
      headerName: 'Trade Date',
      valueFormatter: p => new Date(p.value).toLocaleDateString('en-GB'),
    },
    { field: 'login', headerName: 'Login' },
    { field: 'buyQty', headerName: 'Buy Qty', type: 'numericColumn' },
    { field: 'sellQty', headerName: 'Sell Qty', type: 'numericColumn' },
    { field: 'diffQty', headerName: 'Diff Qty', type: 'numericColumn' },
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
    rowData: [],
    pagination: true,
    paginationPageSize: 25,
    paginationPageSizeSelector: [10, 25, 50, 100],
    rowClassRules: {
      'group-header-row': params => !!params.data?.isGroupHeader,
      'group-total-row': params => !!params.data?.isGroupTotal,
    },
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
        this.updateRowData();
      });
  }

  onGroupChange() {
    this.updateColumnDefs();
    this.updateRowData();
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
    this.columnDefs = defs;
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', defs);
      setTimeout(() => this.gridApi.sizeColumnsToFit(), 0);
    }
  }

  private groupByKey(
    rows: StandingGridRow[],
    key: 'tradeDate' | 'login' | 'symbol'
  ): StandingGridRow[] {
    if (!Array.isArray(rows)) return [];
    const groups: Record<string, StandingGridRow[]> = {};
    rows.forEach(r => {
      const val = (r as any)[key];
      const g = String(val ?? '');
      (groups[g] ||= []).push(r);
    });
    const result: StandingGridRow[] = [];
    for (const [g, items] of Object.entries(groups)) {
      result.push({ isGroupHeader: true, [key]: g } as any);
      result.push(...items);
      const total: StandingGridRow = {
        tradeDate: key === 'tradeDate' ? (items[0].tradeDate as any) : (null as any),
        login: key === 'login' ? (items[0].login as any) : (null as any),
        symbol: key === 'symbol' ? (items[0].symbol as any) : (null as any),
        buyQty: items.reduce((s, r) => s + (r.buyQty || 0), 0),
        sellQty: items.reduce((s, r) => s + (r.sellQty || 0), 0),
        diffQty: items.reduce((s, r) => s + (r.diffQty || 0), 0),
        isGroupTotal: true,
      };
      result.push(total);
    }
    return result;
  }

  private updateRowData() {
    if (!this.gridApi) return;
    const field: 'tradeDate' | 'login' | 'symbol' =
      this.groupBy === 'date'
        ? 'tradeDate'
        : this.groupBy === 'login'
        ? 'login'
        : 'symbol';
    const grouped = this.groupByKey(this.rows, field);
    this.gridApi.setGridOption('rowData', grouped);
  }
}
