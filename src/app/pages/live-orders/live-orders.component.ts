import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealsService, OrderRow } from '@services/deals.service';
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
  selector: 'app-live-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule, AgGridAngular],
  templateUrl: './live-orders.component.html',
  styleUrls: ['./live-orders.component.scss'],
})
export class LiveOrdersComponent {
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
    rowSelection: 'single',
    animateRows: true,
    getRowId: p => String(p.data.order),
  };

  private gridApi!: GridApi<OrderRow>;

  constructor(private svc: DealsService) {}

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.svc.getOrdersSnapshot().subscribe(rows => {
      this.gridApi.setGridOption('rowData', rows);
    });
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }
}
