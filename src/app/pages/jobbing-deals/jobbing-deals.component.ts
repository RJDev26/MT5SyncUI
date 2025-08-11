import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealsService, JobbingDealRow } from '@services/deals.service';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';
import { AgGridModule, AgGridAngular } from 'ag-grid-angular';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-jobbing-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule, AgGridAngular],
  templateUrl: './jobbing-deals.component.html',
  styleUrls: ['./jobbing-deals.component.scss'],
})
export class JobbingDealsComponent {
  gridOptions: GridOptions = {
    theme: 'legacy',
    columnDefs: [
      { field: 'login', headerName: 'Login' },
      {
        field: 'buyTime',
        headerName: 'Buy Time',
        valueFormatter: p => new Date(p.value).toLocaleTimeString(),
      },
      {
        field: 'sellTime',
        headerName: 'Sell Time',
        valueFormatter: p => new Date(p.value).toLocaleTimeString(),
      },
      { field: 'buyDeal', headerName: 'Buy Deal' },
      { field: 'sellDeal', headerName: 'Sell Deal' },
      { field: 'diffSec', headerName: 'DiffSec', type: 'numericColumn' },
      { field: 'symbol', headerName: 'Symbol' },
      { field: 'bQty', headerName: 'B Qty', type: 'numericColumn' },
      { field: 'sQty', headerName: 'S Qty', type: 'numericColumn' },
      { field: 'buyPrice', headerName: 'Buy Price', type: 'numericColumn' },
      { field: 'sellPrice', headerName: 'Sell Price', type: 'numericColumn' },
      { field: 'priceDiff', headerName: 'Price Diff', type: 'numericColumn' },
      { field: 'mtm', headerName: 'MTM', type: 'numericColumn' },
      { field: 'comm', headerName: 'Comm', type: 'numericColumn' },
      { field: 'commR', headerName: 'CommR', type: 'numericColumn' },
      { field: 'mtmr', headerName: 'MTMR', type: 'numericColumn' },
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 88,
    },
    rowData: [],
    rowSelection: 'single',
    animateRows: true,
    getRowId: p => String(p.data.buyDeal) + '-' + String(p.data.sellDeal),
  };

  intervalMinutes = 5;
  private gridApi!: GridApi<JobbingDealRow>;

  constructor(private svc: DealsService) {}

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.loadData();
  }

  onIntervalChange() {
    this.loadData();
  }

  loadData() {
    this.svc.getJobbingDeals(this.intervalMinutes).subscribe(rows => {
      this.gridApi.setGridOption('rowData', rows);
    });
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }
}
