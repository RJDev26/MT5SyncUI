import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
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
    MatDialogModule,
    AgGridModule
  ],
  templateUrl: './client-master.component.html',
  styleUrls: ['./client-master.component.scss']
})
export class ClientMasterComponent implements OnInit {
  logins: LoginOption[] = [];
  selectedLogin?: number;
  showUpdated = false;
  gridOptions: GridOptions<LoginClientInfo> = {
    theme: 'legacy',
    rowHeight: 32,
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
      { field: 'brokShare', headerName: 'Brok Share', type: 'numericColumn' },
      { field: 'managerShare', headerName: 'Manager Share', type: 'numericColumn' },
      { field: 'currency', headerName: 'Currency' },
      { field: 'commission', headerName: 'Commission', type: 'numericColumn' },
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
    this.svc.getLogins().subscribe(res => (this.logins = res));
  }

  onGridReady(event: GridReadyEvent<LoginClientInfo>) {
    this.gridApi = event.api;
  }

  show() {
    this.svc
      .getLoginsWithClientInfo(this.selectedLogin ?? null, this.showUpdated)
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
      this.openDialog({
        action,
        id: clientId ?? 0,
        login,
        managerId: managerId ?? 0,
        brokerId: brokerId ?? 0,
        exId: exId ?? 0,
        brokShare: brokShare ?? 0,
        managerShare: managerShare ?? 0,
        currency: currency ?? '',
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
    this.svc.deleteClientMaster(id).subscribe(() => this.show());
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv({ fileName: 'client-master.csv' });
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
        <mat-select [(ngModel)]="data.login">
          <mat-option *ngFor="let l of logins" [value]="l.login">
            {{ l.login }} - {{ l.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <div class="triple-row">
        <mat-form-field appearance="outline">
          <mat-label>Manager</mat-label>
          <mat-select [(ngModel)]="data.managerId">
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
              {{ e.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div class="triple-row">
        <mat-form-field appearance="outline">
          <mat-label>Brok Share</mat-label>
          <input matInput type="number" [(ngModel)]="data.brokShare" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Manager Share</mat-label>
          <input matInput type="number" [(ngModel)]="data.managerShare" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Commission</mat-label>
          <input matInput type="number" [(ngModel)]="data.commission" />
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Currency</mat-label>
        <input matInput [(ngModel)]="data.currency" />
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="data">Save</button>
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
    `
  ]
})
export class ClientMasterDialogComponent implements OnInit {
  managers: MasterItem[] = [];
  brokers: MasterItem[] = [];
  exchanges: MasterItem[] = [];
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
  }
}
