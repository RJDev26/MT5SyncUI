import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AgGridModule } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  FirstDataRenderedEvent,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  ModuleRegistry,
  ValueFormatterParams,
} from 'ag-grid-community';
import { finalize } from 'rxjs/operators';
import {
  CreateUserRoleRequest,
  UpdateUserRoleRequest,
  UserRole,
  UserRolesService,
} from '@services/user-roles.service';
import {
  UserRoleFormDialogComponent,
  UserRoleFormDialogData,
  UserRoleFormDialogResult,
} from './user-role-form-dialog.component';
import {
  UserRoleResetPasswordDialogComponent,
  UserRoleResetPasswordDialogData,
  UserRoleResetPasswordDialogResult,
} from './user-role-reset-password-dialog.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss'],
})
export class UserRolesComponent implements OnInit {
  private readonly actionsCellRenderer = (
    params: ICellRendererParams<UserRole, unknown>
  ): HTMLElement => this.buildActionsCell(params.data);

  columnDefs: ColDef<UserRole>[] = [
    {
      headerName: 'User Name',
      field: 'userName',
      minWidth: 150,
    },
    {
      headerName: 'Email',
      field: 'email',
      minWidth: 220,
    },
    {
      headerName: 'User ID',
      field: 'userId',
      minWidth: 120,
      valueFormatter: (params: ValueFormatterParams<UserRole, number | null>) =>
        params.value != null ? `${params.value}` : '',
    },
    {
      headerName: 'Role',
      field: 'role',
      minWidth: 120,
    },
    {
      headerName: 'Email Confirmed',
      field: 'emailConfirmed',
      minWidth: 150,
      valueFormatter: (params: ValueFormatterParams<UserRole, boolean | null>) =>
        params.value === true ? 'Yes' : 'No',
    },
    {
      headerName: 'Head',
      field: 'head',
      minWidth: 150,
      valueFormatter: (params: ValueFormatterParams<UserRole, string | null>) => params.value ?? '',
    },
    {
      headerName: 'Status',
      field: 'status',
      minWidth: 120,
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      minWidth: 140,
      maxWidth: 180,
      sortable: false,
      filter: false,
      cellRenderer: this.actionsCellRenderer,
    },
  ];

  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 120,
    sortable: true,
    filter: true,
    resizable: true,
  };

  rowData: UserRole[] = [];
  loading = false;
  private gridApi?: GridApi<UserRole>;
  overlayNoRowsTemplate = '<span class="no-rows">No users found.</span>';
  constructor(
    private readonly userRolesService: UserRolesService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserRoles();
  }

  onGridReady(event: GridReadyEvent<UserRole>): void {
    this.gridApi = event.api;
  }

  onFirstDataRendered(event: FirstDataRenderedEvent<UserRole>): void {
    event.api.sizeColumnsToFit({ defaultMinWidth: 120 });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open<UserRoleFormDialogComponent, UserRoleFormDialogData, UserRoleFormDialogResult>(
      UserRoleFormDialogComponent,
      {
        width: '420px',
        data: {
          mode: 'create',
        },
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result?.mode === 'create') {
        this.createUserRole(result.payload);
      }
    });
  }

  private createUserRole(payload: CreateUserRoleRequest): void {
    this.loading = true;
    this.userRolesService.createUserRole(payload).subscribe({
      next: () => {
        this.showSuccess('User created successfully.');
        this.loadUserRoles();
      },
      error: () => {
        this.loading = false;
        this.showError('Failed to create user.');
      },
    });
  }

  private loadUserRoles(): void {
    this.loading = true;
    this.userRolesService
      .getUserRoles()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: users => {
          this.rowData = users ?? [];
          this.autoSizeColumns();
        },
        error: () => {
          this.rowData = [];
          this.showError('Failed to load users.');
        },
      });
  }

  private autoSizeColumns(): void {
    if (!this.gridApi) {
      return;
    }
    setTimeout(() => {
      this.gridApi?.sizeColumnsToFit({ defaultMinWidth: 120 });
    });
  }

  private buildActionsCell(user: UserRole | undefined): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('actions-cell');

    if (!user) {
      return container;
    }

    const editButton = this.createIconButton({
      icon: 'edit',
      title: 'Edit user',
      onClick: () => this.openEditDialog(user),
    });
    const resetButton = this.createIconButton({
      icon: 'lock_reset',
      title: 'Reset user password',
      onClick: () => this.openResetPasswordDialog(user),
      tone: 'warn',
    });

    container.append(editButton, resetButton);
    return container;
  }

  private createIconButton(config: {
    icon: string;
    title: string;
    onClick: () => void;
    tone?: 'primary' | 'warn';
  }): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('icon-button');
    if (config.tone === 'warn') {
      button.classList.add('warn');
    }
    button.title = config.title;
    button.setAttribute('aria-label', config.title);
    button.innerHTML = `<span class="material-icons">${config.icon}</span>`;
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      config.onClick();
    });
    return button;
  }

  private openEditDialog(user: UserRole): void {
    const dialogRef = this.dialog.open<
      UserRoleFormDialogComponent,
      UserRoleFormDialogData,
      UserRoleFormDialogResult
    >(UserRoleFormDialogComponent, {
      width: '960px',
      data: {
        mode: 'edit',
        user,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.mode === 'edit') {
        this.updateUserRole(result.id, result.payload);
      }
    });
  }

  private updateUserRole(id: string, payload: UpdateUserRoleRequest): void {
    this.loading = true;
    this.userRolesService.updateUserRole(id, payload).subscribe({
      next: () => {
        this.showSuccess('User updated successfully.');
        this.loadUserRoles();
      },
      error: () => {
        this.loading = false;
        this.showError('Failed to update user.');
      },
    });
  }

  private openResetPasswordDialog(user: UserRole): void {
    const dialogRef = this.dialog.open<
      UserRoleResetPasswordDialogComponent,
      UserRoleResetPasswordDialogData,
      UserRoleResetPasswordDialogResult
    >(UserRoleResetPasswordDialogComponent, {
      width: '400px',
      data: {
        user,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.resetPassword(result.id, result.payload.newPassword);
      }
    });
  }

  private resetPassword(id: string, newPassword: string): void {
    this.loading = true;
    this.userRolesService.resetPassword(id, { newPassword }).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess('Password reset successfully.');
      },
      error: () => {
        this.loading = false;
        this.showError('Failed to reset password.');
      },
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 4000,
      panelClass: ['snackbar-error'],
    });
  }
}
