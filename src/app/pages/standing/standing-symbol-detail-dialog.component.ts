import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AgGridModule } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridApi,
  GridOptions,
  ModuleRegistry,
} from 'ag-grid-community';
import { StandingRow } from '@services/deals.service';

interface DialogData {
  symbol: string;
  rows: (StandingRow & { netQty?: number })[];
}

interface DetailRow extends StandingRow {
  netQty?: number;
}

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-standing-symbol-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, AgGridModule],
  template: `
    <h2 mat-dialog-title>{{ data.symbol }} Details</h2>
    <mat-dialog-content class="detail-grid-wrapper">
      <ag-grid-angular
        *ngIf="data.rows.length; else noData"
        class="ag-theme-alpine detail-grid"
        [gridOptions]="gridOptions"
      ></ag-grid-angular>
      <ng-template #noData>
        <p class="empty-state">No records found for the selected symbol.</p>
      </ng-template>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .detail-grid-wrapper {
        height: 65vh;
        width: 100%;
      }
      .detail-grid {
        width: 100%;
        height: 100%;
      }
      .empty-state {
        margin: 0;
      }
    `,
  ],
})
export class StandingSymbolDetailDialogComponent {
  columnDefs: ColDef<DetailRow>[] = [
    { field: 'login', headerName: 'Login', minWidth: 140 },
    {
      field: 'buyQty',
      headerName: 'Buy Qty',
      type: 'numericColumn',
      valueFormatter: params => this.formatNumber(params.value),
      cellClass: ['ag-right-aligned-cell'],
      minWidth: 140,
    },
    {
      field: 'sellQty',
      headerName: 'Sell Qty',
      type: 'numericColumn',
      valueFormatter: params => this.formatNumber(params.value),
      cellClass: ['ag-right-aligned-cell'],
      minWidth: 140,
    },
    {
      field: 'netQty',
      headerName: 'Net Qty',
      type: 'numericColumn',
      valueFormatter: params => this.formatNumber(params.value),
      cellClass: ['ag-right-aligned-cell'],
      minWidth: 140,
    },
    {
      field: 'brokerShare',
      headerName: 'Broker Share',
      type: 'numericColumn',
      valueFormatter: params => this.formatNumber(params.value),
      cellClass: ['ag-right-aligned-cell'],
      minWidth: 160,
    },
    {
      field: 'managerShare',
      headerName: 'Manager Share',
      type: 'numericColumn',
      valueFormatter: params => this.formatNumber(params.value),
      cellClass: ['ag-right-aligned-cell'],
      minWidth: 170,
    },
  ];

  gridOptions: GridOptions<DetailRow>;
  private gridApi?: GridApi<DetailRow>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.gridOptions = {
      theme: 'legacy',
      rowData: this.data.rows,
      columnDefs: this.columnDefs,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        flex: 1,
      },
      rowHeight: 26,
      pagination: true,
      paginationPageSize: 100,
      paginationPageSizeSelector: [50, 100, 200],
      domLayout: 'normal',
      onGridReady: params => this.onGridReady(params),
    };
  }

  private onGridReady(params: { api: GridApi<DetailRow> }): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  formatNumber(value?: number | null): string {
    if (value == null) {
      return '';
    }
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return '';
    }
    if (Math.abs(num) < 0.00001) {
      return '0.00';
    }
    return num.toFixed(2);
  }
}
