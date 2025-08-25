import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AgGridModule } from 'ag-grid-angular';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  CellClickedEvent,
  ModuleRegistry,
  AllCommunityModule,
  ICellRendererParams,
} from 'ag-grid-community';
import { MasterService, MasterItem } from '@services/master.service';
import {
  ClientMasterRequest,
  LoginClientInfo,
  LoginOption,
} from '@services/master.models';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-client-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
    MatDialogModule,
    AgGridModule
  ],
  templateUrl: './client-master.component.html',
  styleUrls: ['./client-master.component.scss']
})
export class ClientMasterComponent implements OnInit {
  logins: LoginOption[] = [];
  filteredLogins: LoginOption[] = [];
  selectedLogin: number | null = null;
  showUpdated = false;
  loginFilter = '';
  currencies: MasterItem[] = [];
  @ViewChild('loginSearch') loginSearch!: ElementRef<HTMLInputElement>;
  gridOptions: GridOptions<LoginClientInfo> = {
    theme: 'legacy',
    rowHeight: 25,
    columnDefs: [
      {
        headerName: 'Actions',
        cellRenderer: (params: ICellRendererParams) =>
          '<span class="material-icons action-icon edit">edit</span>' +
          '<span class="material-icons action-icon delete">delete</span>',
        width: 100,
        minWidth: 100
      },
      { field: 'login', headerName: 'Login' },
      { field: 'userName', headerName: 'User Name' },
      { field: 'managerName', headerName: 'Manager' },
      { field: 'brokerName', headerName: 'Broker' },
      { field: 'exchange', headerName: 'Exchange' },
      {
        field: 'brokShare',
        headerName: 'Brok Share',
        type: 'numericColumn',
        valueFormatter: params => this.formatNumber(params.value),
        cellStyle: { textAlign: 'right' }
      },
      {
        field: 'managerShare',
        headerName: 'Manager Share',
        type: 'numericColumn',
        valueFormatter: params => this.formatNumber(params.value),
        cellStyle: { textAlign: 'right' }
      },
      { field: 'currency', headerName: 'Currency' },
      {
        field: 'commission',
        headerName: 'Commission',
        type: 'numericColumn',
        valueFormatter: params => this.formatNumber(params.value),
        cellStyle: { textAlign: 'right' }
      },
      { field: 'createdDate', headerName: 'Created Date' }
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 100
    },
    rowData: [] as LoginClientInfo[]
  };

  private gridApi!: GridApi<LoginClientInfo>;

  constructor(private svc: MasterService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.svc.getLogins().subscribe(res => {
      this.logins = res;
      this.filteredLogins = res;
    });
    this.svc.getCurrencies().subscribe(res => (this.currencies = res));
  }

  onGridReady(event: GridReadyEvent<LoginClientInfo>) {
    this.gridApi = event.api;
  }

  show() {
    this.svc
      .getLoginsWithClientInfo(this.selectedLogin, this.showUpdated)
      .subscribe(res => this.gridApi.setGridOption('rowData', res));
  }

  onCellClicked(event: CellClickedEvent<LoginClientInfo>) {
    if (event.colDef.headerName !== 'Actions' || !event.data) {
      return;
    }
    const target = event.event?.target as HTMLElement | null;
    if (!target) return;
    if (target.classList.contains('edit')) {
      const {
        clientId,
        login,
        managerId,
        brokerId,
        exId,
        brokShare,
        managerShare,
        currency,
        commission,
      } = event.data;
      const action = clientId ? 'UPDATE' as const : 'ADD' as const;
      const currencyId = this.currencies.find(
        c => c.name === currency || c.code === currency
      )?.id ?? 0;
      this.openDialog({
        action,
        id: clientId ?? 0,
        login,
        managerId: managerId ?? 0,
        brokerId: brokerId ?? 0,
        exId: exId ?? 0,
        brokShare: brokShare ?? 0,
        managerShare: managerShare ?? 0,
        currencyId,
        commission: commission ?? 0
      });
    }
    if (target.classList.contains('delete')) {
      const id = event.data.clientId;
      if (id) {
        this.delete(id);
      }
    }
  }

  openDialog(data: ClientMasterRequest) {
    const ref = this.dialog.open(ClientMasterDialogComponent, {
      data: { ...data }
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.svc.saveClientMaster(result).subscribe(() => this.show());
      }
    });
  }

  delete(id: number) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this client?')) {
      this.svc.deleteClientMaster(id).subscribe(() => this.show());
    }
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
      l => l.login.toString().includes(term) || l.name.toLowerCase().includes(term)
    );
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv({ fileName: 'client-master.csv' });
  }

  private formatNumber(value: number | null | undefined): string {
    return value != null ? Number(value).toFixed(2) : '';
  }
}

@Component({
  selector: 'app-client-master-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.id ? 'Edit' : 'Add' }} Client</h2>
    <div mat-dialog-content>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Login</mat-label>
        <mat-select [(ngModel)]="data.login" disabled>
          <mat-option *ngFor="let l of logins" [value]="l.login">
            {{ l.login }} - {{ l.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <div class="triple-row">
        <mat-form-field appearance="outline">
          <mat-label>Manager</mat-label>
          <mat-select [(ngModel)]="data.managerId" required>
            <mat-option *ngFor="let m of managers" [value]="m.id">
              {{ m.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Broker</mat-label>
          <mat-select [(ngModel)]="data.brokerId">
            <mat-option *ngFor="let b of brokers" [value]="b.id">
              {{ b.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Exchange</mat-label>
          <mat-select [(ngModel)]="data.exId">
            <mat-option *ngFor="let e of exchanges" [value]="e.id">
              {{ e.id }} - {{ e.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div class="triple-row">
        <mat-form-field appearance="outline" class="right-align">
          <mat-label>Brok Share</mat-label>
          <input
            matInput
            type="number"
            step="0.01"
            [(ngModel)]="data.brokShare"
            (blur)="formatDecimal('brokShare')"
          />
        </mat-form-field>
        <mat-form-field appearance="outline" class="right-align">
          <mat-label>Manager Share</mat-label>
          <input
            matInput
            type="number"
            step="0.01"
            [(ngModel)]="data.managerShare"
            (blur)="formatDecimal('managerShare')"
          />
        </mat-form-field>
        <mat-form-field appearance="outline" class="right-align">
          <mat-label>Commission</mat-label>
          <input
            matInput
            type="number"
            step="0.01"
            [(ngModel)]="data.commission"
            (blur)="formatDecimal('commission')"
          />
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Currency</mat-label>
        <mat-select [(ngModel)]="data.currencyId" required>
          <mat-option *ngFor="let c of currencies" [value]="c.id">
            {{ c.id }} - {{ c.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [mat-dialog-close]="data"
        [disabled]="!data.managerId || !data.currencyId"
      >
        Save
      </button>
    </div>
  `,
  styles: [
    `
      .triple-row {
        display: flex;
        gap: 1rem;
      }
      .triple-row mat-form-field {
        flex: 1;
      }
      .w-100 {
        width: 100%;
      }
      .right-align input {
        text-align: right;
      }
    `
  ]
})
export class ClientMasterDialogComponent implements OnInit {
  managers: MasterItem[] = [];
  brokers: MasterItem[] = [];
  exchanges: MasterItem[] = [];
  currencies: MasterItem[] = [];
  logins: LoginOption[] = [];

  constructor(
    private svc: MasterService,
    @Inject(MAT_DIALOG_DATA) public data: ClientMasterRequest
  ) {}

  ngOnInit(): void {
    this.svc.getLogins().subscribe(res => (this.logins = res));
    this.svc.getManagers().subscribe(res => (this.managers = res));
    this.svc.getBrokers().subscribe(res => (this.brokers = res));
    this.svc.getExchanges().subscribe(res => (this.exchanges = res));
    this.svc.getCurrencies().subscribe(res => (this.currencies = res));
  }

  formatDecimal(field: 'brokShare' | 'managerShare' | 'commission') {
    const value = this.data[field];
    this.data[field] = value != null ? +Number(value).toFixed(2) : 0;
  }
}
