import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
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
import { DealsService, DealHistoryRow } from '@services/deals.service';
import { MasterService, LoginOption } from '@services/master.service';
import { format } from 'date-fns';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-deal-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    AgGridModule,
  ],
  templateUrl: './deal-history.component.html',
  styleUrls: ['./deal-history.component.scss'],
})
export class DealHistoryComponent implements OnInit {
  fromDate = new Date();
  toDate = new Date();
  login: number | null = null;
  logins: LoginOption[] = [];
  filteredLogins: LoginOption[] = [];
  loginFilter = '';
  @ViewChild('loginSearch') loginSearch!: ElementRef<HTMLInputElement>;
  rowCount = 0;

  gridOptions: GridOptions<DealHistoryRow> = {
    theme: 'legacy',
    rowHeight: 25,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    columnDefs: [
      { field: 'login', headerName: 'Login' },
      {
        field: 'time',
        headerName: 'Time',
        valueFormatter: p => (p.value ? format(new Date(p.value), 'dd/MM/yyyy HH:mm:ss') : '')
      },
      { field: 'deal', headerName: 'Deal', type: 'numericColumn', cellClass: 'ag-right-aligned-cell' },
      { field: 'symbol', headerName: 'Symbol' },
      { field: 'contype', headerName: 'Con Type' },
      { field: 'qty', headerName: 'Qty', type: 'numericColumn', cellClass: 'ag-right-aligned-cell', valueFormatter: p => this.formatNumber(p.value) },
      { field: 'price', headerName: 'Price', type: 'numericColumn', cellClass: 'ag-right-aligned-cell', valueFormatter: p => this.formatNumber(p.value) },
      { field: 'profit', headerName: 'Profit', type: 'numericColumn', cellClass: 'ag-right-aligned-cell', valueFormatter: p => this.formatNumber(p.value) },
      { field: 'commission', headerName: 'Commission', type: 'numericColumn', cellClass: 'ag-right-aligned-cell', valueFormatter: p => this.formatNumber(p.value) },
      { field: 'comment', headerName: 'Comment', minWidth: 150 },
    ],
    rowData: [],
    pagination: true,
    paginationPageSize: 100,
    paginationPageSizeSelector: [50, 100, 200],
  };

  private gridApi!: GridApi<DealHistoryRow>;

  constructor(private deals: DealsService, private master: MasterService) {}

  ngOnInit(): void {
    this.master.getLogins().subscribe(res => {
      this.logins = res;
      this.filteredLogins = res;
    });
  }

  onGridReady(event: GridReadyEvent<DealHistoryRow>) {
    this.gridApi = event.api;
  }

  show() {
    const from = format(this.fromDate, 'yyyy/MM/dd');
    const to = format(this.toDate, 'yyyy/MM/dd');
    this.gridApi.setGridOption('loading', true);
    this.deals.getDealHistory(from, to, this.login ?? undefined).subscribe({
      next: res => {
        this.rowCount = res.rowCount;
        this.gridApi.setGridOption('rowData', res.rows);
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

  onLoginDropdownOpen(open: boolean) {
    if (open) {
      this.loginFilter = '';
      this.filteredLogins = this.logins.slice();
      setTimeout(() => this.loginSearch?.nativeElement.focus());
    }
  }

  filterLogins(value: string) {
    this.loginFilter = value;
    const term = value.toLowerCase();
    this.filteredLogins = this.logins.filter(
      l =>
        l.login.toString().includes(term) || l.name.toLowerCase().includes(term)
    );
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv({ fileName: 'DealHistory' });
  }

  formatNumber(val: any): string {
    const num = Number(val);
    return isNaN(num)
      ? ''
      : num.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  }
}

