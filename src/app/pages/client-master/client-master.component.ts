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
import {
  AgGridModule,
  AgGridAngular
} from 'ag-grid-angular';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry,
  AllCommunityModule,
  ICellRendererParams
} from 'ag-grid-community';
import { MasterService, ClientMasterRequest } from '@services/master.service';
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
    AgGridModule,
    AgGridAngular
  ],
  templateUrl: './client-master.component.html',
  styleUrls: ['./client-master.component.scss']
})
export class ClientMasterComponent implements OnInit {
  logins: number[] = [];
  selectedLogin?: number;
  showUpdated = false;
  gridOptions: GridOptions = {
    theme: 'legacy',
    columnDefs: [
      { field: 'login', headerName: 'Login' },
      { field: 'userName', headerName: 'User Name' },
      { field: 'clientId', headerName: 'Client Id' },
      { field: 'managerName', headerName: 'Manager' },
      { field: 'brokerName', headerName: 'Broker' },
      { field: 'exchange', headerName: 'Exchange' },
      { field: 'brokShare', headerName: 'Brok Share', type: 'numericColumn' },
      { field: 'managerShare', headerName: 'Manager Share', type: 'numericColumn' },
      { field: 'currency', headerName: 'Currency' },
      { field: 'commission', headerName: 'Commission', type: 'numericColumn' },
      { field: 'createdDate', headerName: 'Created Date' },
      {
        headerName: 'Actions',
        cellRenderer: (params: ICellRendererParams) =>
          '<span class="material-icons action-icon edit">edit</span>' +
          '<span class="material-icons action-icon delete">delete</span>',
        width: 100,
        minWidth: 100
      }
    ],
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 100
    },
    rowData: []
  };

  private gridApi!: GridApi;

  constructor(private svc: MasterService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.svc.getLogins().subscribe(res => (this.logins = res));
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
  }

  show() {
    if (this.selectedLogin == null) {
      return;
    }
    this.svc
      .getLoginsWithClientInfo(this.selectedLogin, this.showUpdated)
      .subscribe(res => this.gridApi.setGridOption('rowData', res));
  }

  add() {
    this.openDialog({
      action: 'ADD',
      id: 0,
      login: this.selectedLogin || 0,
      managerId: 0,
      brokerId: 0,
      exId: 0,
      brokShare: 0,
      managerShare: 0,
      currency: '',
      commission: 0,
      createdBy: 0
    });
  }

  onCellClicked(event: any) {
    if (event.colDef.headerName !== 'Actions') {
      return;
    }
    const target = event.event.target as HTMLElement;
    if (target.classList.contains('edit')) {
      const { clientId, ...rest } = event.data || {};
      this.openDialog({ action: 'UPDATE', id: clientId || 0, createdBy: 0, ...rest });
    }
    if (target.classList.contains('delete')) {
      this.delete(event.data.clientId);
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
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  template: `
    <h2 mat-dialog-title>{{ data.id ? 'Edit' : 'Add' }} Client</h2>
    <div mat-dialog-content>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Login</mat-label>
        <input matInput type="number" [(ngModel)]="data.login" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Manager Id</mat-label>
        <input matInput type="number" [(ngModel)]="data.managerId" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Broker Id</mat-label>
        <input matInput type="number" [(ngModel)]="data.brokerId" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Exchange Id</mat-label>
        <input matInput type="number" [(ngModel)]="data.exId" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Brok Share</mat-label>
        <input matInput type="number" [(ngModel)]="data.brokShare" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Manager Share</mat-label>
        <input matInput type="number" [(ngModel)]="data.managerShare" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Currency</mat-label>
        <input matInput [(ngModel)]="data.currency" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Commission</mat-label>
        <input matInput type="number" [(ngModel)]="data.commission" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Created By</mat-label>
        <input matInput type="number" [(ngModel)]="data.createdBy" />
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="data">Save</button>
    </div>
  `
})
export class ClientMasterDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ClientMasterRequest) {}
}
