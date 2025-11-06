import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateUserRoleRequest, UpdateUserRoleRequest, UserRole } from '@services/user-roles.service';

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

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role</mat-label>
          <input matInput formControlName="role" required />
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
        min-width: 320px;
      }

      .full-width {
        width: 100%;
      }

      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 8px;
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
  ],
})
export class UserRoleFormDialogComponent {
  readonly form = this.fb.group({
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
    public readonly dialogRef: MatDialogRef<UserRoleFormDialogComponent, UserRoleFormDialogResult>,
    @Inject(MAT_DIALOG_DATA) public readonly data: UserRoleFormDialogData
  ) {
    if (data.user) {
      this.form.patchValue({
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { userName, email, role, isActive } = this.form.getRawValue();

    if (this.data.mode === 'create') {
      const password = this.form.controls.password?.value ?? '';
      const payload: CreateUserRoleRequest = {
        userName: userName!,
        email: email!,
        role: role!,
        isActive: !!isActive,
        password,
      };
      this.dialogRef.close({ mode: 'create', payload });
    } else if (this.data.user) {
      const payload: UpdateUserRoleRequest = {
        userName: userName!,
        email: email!,
        role: role!,
        isActive: !!isActive,
      };
      this.dialogRef.close({ mode: 'edit', id: this.data.user.id, payload });
    }
  }
}
