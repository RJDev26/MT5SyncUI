import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StandingRow } from '@services/deals.service';

interface DialogData {
  symbol: string;
  rows: (StandingRow & { netQty?: number })[];
}

@Component({
  selector: 'app-standing-symbol-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.symbol }} Details</h2>
    <mat-dialog-content>
      <div class="table-wrapper" *ngIf="data.rows.length; else noData">
        <table>
          <thead>
            <tr>
              <th>Login</th>
              <th>Buy Qty</th>
              <th>Sell Qty</th>
              <th>Net Qty</th>
              <th>Broker Share</th>
              <th>Manager Share</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of data.rows">
              <td>{{ row.login }}</td>
              <td class="numeric">{{ formatNumber(row.buyQty) }}</td>
              <td class="numeric">{{ formatNumber(row.sellQty) }}</td>
              <td class="numeric">{{ formatNumber(row.netQty) }}</td>
              <td class="numeric">{{ formatNumber(row.brokerShare) }}</td>
              <td class="numeric">{{ formatNumber(row.managerShare) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
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
      .table-wrapper {
        max-height: 60vh;
        overflow: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        padding: 0.5rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      }
      th {
        text-align: left;
        position: sticky;
        top: 0;
        background: #fafafa;
        z-index: 1;
      }
      .numeric {
        text-align: right;
      }
      .empty-state {
        margin: 0;
      }
    `,
  ],
})
export class StandingSymbolDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

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
