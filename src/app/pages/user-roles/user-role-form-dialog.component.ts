import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, GridApi, ModuleRegistry } from 'ag-grid-community';
import { forkJoin } from 'rxjs';
import {
  CreateUserRoleRequest,
  Manager,
  ManagerMappingAction,
  UpdateUserRoleRequest,
  UserRole,
  UserRolesService,
} from '@services/user-roles.service';
import { LoginOption, MasterService } from '@services/master.service';

ModuleRegistry.registerModules([AllCommunityModule]);

export interface UserRoleFormDialogData {
  mode: 'create' | 'edit';
  user?: UserRole;
}

export type UserRoleFormDialogResult =
  | { mode: 'create'; payload: CreateUserRoleRequest }
  | { mode: 'edit'; id: string; payload: UpdateUserRoleRequest };

@Component({
  selector: 'app-user-role-form-dialog',
  standalone: true,
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add User' : 'Edit User' }}</h2>
    <form class="user-role-form" [formGroup]="form" (ngSubmit)="submit()">
      <mat-tab-group>
        <mat-tab label="User Details">
          <mat-dialog-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>User Name</mat-label>
              <input matInput formControlName="userName" required />
              <mat-error *ngIf="form.controls.userName.hasError('required')">
                User name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" required />
              <mat-error *ngIf="form.controls.email.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="form.controls.email.hasError('email')">
                Enter a valid email address
              </mat-error>
            </mat-form-field>

            <div class="login-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Login Digits</mat-label>
                <mat-select
                  formControlName="loginDigit"
                  (selectionChange)="applyLoginDigitFilter()"
                >
                  <mat-option value="all">All</mat-option>
                  <mat-option value="4">4 Digit</mat-option>
                  <mat-option value="6">6 Digit</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Login</mat-label>
                <mat-select formControlName="login" placeholder="Select login">
                  <mat-option *ngFor="let option of filteredLogins" [value]="option.login">
                    {{ option.login }} - {{ option.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role" required>
                <mat-option *ngFor="let option of roleOptions" [value]="option.value">
                  {{ option.label }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="form.controls.role.hasError('required')">
                Role is required
              </mat-error>
            </mat-form-field>

            <ng-container *ngIf="data.mode === 'create'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" required />
                <mat-error *ngIf="form.controls.password?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="form.controls.password?.hasError('minlength')">
                  Password must be at least 6 characters
                </mat-error>
              </mat-form-field>
            </ng-container>

            <mat-checkbox formControlName="isActive">Active</mat-checkbox>
          </mat-dialog-content>
        </mat-tab>

        <mat-tab *ngIf="data.mode === 'edit'" label="User Manager Access">
          <mat-dialog-content class="manager-access">
            <div class="grid-wrapper">
              <div class="grid-container">
                <div class="grid-title">Select Manager</div>
                <ag-grid-angular
                  style="width: 100%; height: 320px;"
                  class="ag-theme-material"
                  [rowData]="managerRows"
                  [columnDefs]="managerColumns"
                  [rowSelection]="'multiple'"
                  [overlayNoRowsTemplate]="noManagersTemplate"
                  (gridReady)="onManagersGridReady($event)"
                ></ag-grid-angular>
              </div>

              <div class="grid-actions">
                <button
                  mat-mini-fab
                  color="primary"
                  type="button"
                  aria-label="Add selected"
                  (click)="addSelectedManagers()"
                  [disabled]="!managerGridApi"
                >
                  <span class="material-icons">chevron_right</span>
                </button>
                <button
                  mat-mini-fab
                  color="warn"
                  type="button"
                  aria-label="Remove selected"
                  (click)="removeSelectedManagers()"
                  [disabled]="!assignedGridApi"
                >
                  <span class="material-icons">chevron_left</span>
                </button>
              </div>

              <div class="grid-container">
                <div class="grid-title">Assigned Managers</div>
                <ag-grid-angular
                  style="width: 100%; height: 320px;"
                  class="ag-theme-material"
                  [rowData]="assignedManagerRows"
                  [columnDefs]="assignedColumns"
                  [rowSelection]="'multiple'"
                  [overlayNoRowsTemplate]="noManagersTemplate"
                  (gridReady)="onAssignedGridReady($event)"
                ></ag-grid-angular>
              </div>
            </div>
          </mat-dialog-content>
        </mat-tab>
      </mat-tab-group>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
          {{ data.mode === 'create' ? 'Create' : 'Update' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .user-role-form {
        display: flex;
        flex-direction: column;
        min-width: 600px;
      }

      .full-width {
        width: 100%;
      }

      .login-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }

      .half-width {
        flex: 1;
        min-width: 220px;
      }

      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 8px;
      }

      .manager-access {
        min-height: 360px;
        padding: 8px 0 0;
      }

      .grid-wrapper {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 12px;
        align-items: center;
      }

      .grid-container {
        display: flex;
        flex-direction: column;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 8px;
        background: #fafafa;
      }

      .grid-title {
        font-weight: 600;
        padding: 4px 0 8px;
      }

      .grid-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        justify-content: center;
        align-items: center;
      }
    `,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTabsModule,
    AgGridModule,
  ],
})
export class UserRoleFormDialogComponent implements OnInit {
  readonly roleOptions = [
    { label: 'Admin', value: 'Admin' },
    { label: 'User', value: 'User' },
  ];

  readonly managerColumns: ColDef<Manager>[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 60,
      maxWidth: 70,
    },
    { headerName: 'Manager Name', field: 'name', flex: 1 },
  ];

  readonly assignedColumns: ColDef<Manager>[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 60,
      maxWidth: 70,
    },
    { headerName: 'Selected Manager', field: 'name', flex: 1 },
  ];

  managerRows: Manager[] = [];
  assignedManagerRows: Manager[] = [];
  logins: LoginOption[] = [];
  filteredLogins: LoginOption[] = [];

  managerGridApi?: GridApi<Manager>;
  assignedGridApi?: GridApi<Manager>;
  noManagersTemplate = '<span class="no-rows">No records found.</span>';

  readonly form = this.fb.group({
    loginDigit: this.fb.control<'all' | '4' | '6'>('all'),
    login: this.fb.control<number | null>(null),
    userName: this.fb.control('', { validators: [Validators.required] }),
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    role: this.fb.control('', { validators: [Validators.required] }),
    isActive: this.fb.control(true),
    password: this.fb.control('', {
      validators: this.data.mode === 'create' ? [Validators.required, Validators.minLength(6)] : [],
    }),
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly masterService: MasterService,
    private readonly userRolesService: UserRolesService,
    public readonly dialogRef: MatDialogRef<UserRoleFormDialogComponent, UserRoleFormDialogResult>,
    @Inject(MAT_DIALOG_DATA) public readonly data: UserRoleFormDialogData
  ) {
    if (data.user) {
      this.form.patchValue({
        login: data.user.userId ?? null,
        userName: data.user.userName,
        email: data.user.email,
        role: data.user.role,
        isActive: data.user.status?.toLowerCase() !== 'inactive',
      });
    }

    if (data.mode === 'edit') {
      this.form.controls.password.disable();
    }
  }

  ngOnInit(): void {
    this.loadLogins();
    if (this.data.mode === 'edit') {
      this.loadManagers();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { userName, email, role, isActive, login } = this.form.getRawValue();

    if (this.data.mode === 'create') {
      const password = this.form.controls.password?.value ?? '';
      const payload: CreateUserRoleRequest = {
        userName: userName!,
        email: email!,
        role: role!,
        isActive: !!isActive,
        login: login ?? undefined,
        password,
      };
      this.dialogRef.close({ mode: 'create', payload });
    } else if (this.data.user) {
      const payload: UpdateUserRoleRequest = {
        userName: userName!,
        email: email!,
        role: role!,
        isActive: !!isActive,
        login: login ?? undefined,
      };
      this.dialogRef.close({ mode: 'edit', id: this.data.user.id, payload });
    }
  }

  onManagersGridReady(event: { api: GridApi<Manager> }): void {
    this.managerGridApi = event.api;
  }

  onAssignedGridReady(event: { api: GridApi<Manager> }): void {
    this.assignedGridApi = event.api;
  }

  addSelectedManagers(): void {
    if (!this.managerGridApi || !this.data.user) {
      return;
    }
    const selection = this.managerGridApi.getSelectedRows();
    if (!selection.length) {
      return;
    }

    this.persistManagerMapping(selection, 'INSERT');
  }

  removeSelectedManagers(): void {
    if (!this.assignedGridApi || !this.data.user) {
      return;
    }
    const selection = this.assignedGridApi.getSelectedRows();
    if (!selection.length) {
      return;
    }

    this.persistManagerMapping(selection, 'DELETE');
  }

  private loadManagers(): void {
    if (!this.data.user) {
      return;
    }

    forkJoin({
      allManagers: this.userRolesService.getManagers(),
      assigned: this.userRolesService.getUserManagers(this.data.user.userId),
    }).subscribe(({ allManagers, assigned }) => {
      const assignedIds = new Set(assigned.map(m => m.id));
      this.assignedManagerRows = assigned;
      this.managerRows = allManagers.filter(m => !assignedIds.has(m.id));
    });
  }

  private loadLogins(): void {
    this.masterService.getLogins().subscribe(options => {
      this.logins = options ?? [];
      this.applyLoginDigitFilter();
    });
  }

  applyLoginDigitFilter(): void {
    const filter = this.form.controls.loginDigit.value ?? 'all';
    const targetLength = filter === 'all' ? null : Number(filter);
    this.filteredLogins = this.logins.filter(option => {
      if (!targetLength) {
        return true;
      }
      return option.login.toString().length === targetLength;
    });

    const selectedLogin = this.form.controls.login.value;
    if (selectedLogin != null) {
      const stillExists = this.filteredLogins.some(option => option.login === selectedLogin);
      if (!stillExists) {
        this.form.controls.login.setValue(null);
      }
    }
  }

  private persistManagerMapping(selection: Manager[], action: ManagerMappingAction): void {
    if (!this.data.user) {
      return;
    }

    const managerIds = selection.map(m => m.id);

    this.userRolesService
      .updateManagerMapping(this.data.user.userId, managerIds, action)
      .subscribe(() => {
        if (action === 'INSERT') {
          const existingIds = new Set(this.assignedManagerRows.map(m => m.id));
          const toAdd = selection.filter(manager => !existingIds.has(manager.id));
          this.assignedManagerRows = [...this.assignedManagerRows, ...toAdd];
          this.managerRows = this.managerRows.filter(m => !toAdd.some(add => add.id === m.id));
          this.managerGridApi?.deselectAll();
        } else {
          const selectionIds = new Set(selection.map(m => m.id));
          this.assignedManagerRows = this.assignedManagerRows.filter(m => !selectionIds.has(m.id));
          this.managerRows = [...this.managerRows, ...selection];
          this.assignedGridApi?.deselectAll();
        }
      });
  }
}
