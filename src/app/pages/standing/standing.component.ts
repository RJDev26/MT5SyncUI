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
  AllCommunityModule,
} from 'ag-grid-community';
import { DealsService, StandingRow } from '@services/deals.service';
import { MasterService, MasterItem, LoginOption } from '@services/master.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StandingGridRow extends StandingRow {
  isGroupHeader?: boolean;
  isGroupTotal?: boolean;
}

ModuleRegistry.registerModules([AllCommunityModule]);

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

  groupColSpan(params: any): number {
    return params.data?.isGroupHeader ? this.columnDefs.length : 1;
  }

  dateColumnDefs: ColDef<StandingGridRow>[] = [
    { field: 'login', headerName: 'Login', colSpan: p => this.groupColSpan(p) },
    { field: 'symbol', headerName: 'Symbol' },
    {
      field: 'buyQty',
      headerName: 'Buy Qty',
      type: 'numericColumn',
      valueFormatter: this.formatQty,
      cellClass: ['buy-cell', 'ag-right-aligned-cell'],
    },
    {
      field: 'sellQty',
      headerName: 'Sell Qty',
      type: 'numericColumn',
      valueFormatter: this.formatQty,
      cellClass: ['sell-cell', 'ag-right-aligned-cell'],
    },
  ];

  loginColumnDefs: ColDef<StandingGridRow>[] = [
    { field: 'symbol', headerName: 'Symbol', colSpan: p => this.groupColSpan(p) },
    {
      field: 'buyQty',
      headerName: 'Buy Qty',
      type: 'numericColumn',
      valueFormatter: this.formatQty,
      cellClass: ['buy-cell', 'ag-right-aligned-cell'],
    },
    {
      field: 'sellQty',
      headerName: 'Sell Qty',
      type: 'numericColumn',
      valueFormatter: this.formatQty,
      cellClass: ['sell-cell', 'ag-right-aligned-cell'],
    },
  ];

  symbolColumnDefs: ColDef<StandingGridRow>[] = [
    {
      field: 'tradeDate',
      headerName: 'Date',
      colSpan: p => this.groupColSpan(p),
      valueFormatter: p =>
        p.data?.isGroupHeader || p.data?.isGroupTotal
          ? p.value
          : new Date(p.value).toLocaleDateString('en-GB'),
    },
    { field: 'login', headerName: 'Login' },
    {
      field: 'buyQty',
      headerName: 'Buy Qty',
      type: 'numericColumn',
      valueFormatter: this.formatQty,
      cellClass: ['buy-cell', 'ag-right-aligned-cell'],
    },
    {
      field: 'sellQty',
      headerName: 'Sell Qty',
      type: 'numericColumn',
      valueFormatter: this.formatQty,
      cellClass: ['sell-cell', 'ag-right-aligned-cell'],
    },
  ];

  columnDefs: ColDef<StandingGridRow>[] = [...this.dateColumnDefs];

  gridOptions: GridOptions<StandingGridRow> = {
    theme: 'legacy',
    // Increase row height by ~5% for better readability
    rowHeight: 24,
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
    paginationPageSize: 100,
    paginationPageSizeSelector: [100],
    getRowClass: params => this.getRowClass(params),
    domLayout: 'autoHeight',
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
    this.applyGrouping();
  }

  onShow() {
    const dateStr = this.selectedDate.toISOString().split('T')[0].replace(/-/g, '/');
    this.deals
      .getStanding(dateStr, this.selectedLogin, this.selectedSymbol)
      .subscribe(res => {
        this.rows = res.rows;
        this.applyGrouping();
      });
  }

  onGroupChange() {
    this.updateColumnDefs();
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
    const cols = this.columnDefs.map(c => c.headerName as string);
    const fields = this.columnDefs.map(c => c.field as string);
    const rows: any[] = [];
    this.gridApi.forEachNode(n => {
      const data = n.data as any;
      if (data.isGroupHeader || data.isGroupTotal) return;
      rows.push(fields.map(f => data[f]));
    });
    const doc = new jsPDF();
    (autoTable as any)(doc, { head: [cols], body: rows });
    doc.save('standing.pdf');
  }

  formatQty(params: any): string {
    if (params.value === null || params.value === undefined) {
      return '';
    }
    const num = Number(params.value);
    if (!params.data?.isGroupTotal && num === 0) {
      return '';
    }
    return num.toFixed(2);
  }

  private updateColumnDefs() {
    this.columnDefs =
      this.groupBy === 'date'
        ? this.dateColumnDefs
        : this.groupBy === 'login'
        ? this.loginColumnDefs
        : this.symbolColumnDefs;
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.columnDefs);
      setTimeout(() => this.gridApi.sizeColumnsToFit(), 0);
    }
  }

  private applyGrouping() {
    const keyField = this.groupBy === 'date' ? 'tradeDate' : this.groupBy;
    const grouped = this.groupByKey(this.rows, keyField as any);
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', grouped);
    } else {
      this.gridOptions.rowData = grouped;
    }
  }

  private groupByKey(rows: StandingGridRow[], key: 'tradeDate' | 'login' | 'symbol'): any[] {
    const groups: Record<string, StandingGridRow[]> = {};
    rows.forEach(r => {
      const val = key === 'tradeDate'
        ? new Date(r.tradeDate).toLocaleDateString('en-GB')
        : String((r as any)[key] ?? '');
      groups[val] = groups[val] || [];
      groups[val].push(r);
    });
    const result: any[] = [];
    Object.entries(groups).forEach(([val, groupRows]) => {
      const header: any = { isGroupHeader: true };
      const displayField =
        key === 'tradeDate' ? 'login' : key === 'login' ? 'symbol' : 'login';
      header[displayField] = val;
      result.push(header);
      groupRows.forEach(r => result.push(r));
      const total: any = { isGroupTotal: true };
      total.buyQty = groupRows.reduce((s, r) => s + (r.buyQty || 0), 0);
      total.sellQty = groupRows.reduce((s, r) => s + (r.sellQty || 0), 0);
      const diff = total.buyQty - total.sellQty;
      total[displayField] = `Total: ${val} (Diff: ${diff.toFixed(2)})`;
      result.push(total);
    });
    return result;
  }

  private getRowClass(params: any): string {
    if (params.data?.isGroupHeader) return 'group-header-row';
    if (params.data?.isGroupTotal) return 'group-total-row';
    return '';
  }
}
