import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ResetPasswordRequest, UserRole } from '@services/user-roles.service';

export interface UserRoleResetPasswordDialogData {
  user: UserRole;
}

export interface UserRoleResetPasswordDialogResult {
  id: string;
  payload: ResetPasswordRequest;
}

const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword
    ? { passwordsMismatch: true }
    : null;
};

@Component({
  selector: 'app-user-role-reset-password-dialog',
  standalone: true,
  template: `
    <h2 mat-dialog-title>Reset Password</h2>
    <form class="reset-password-form" [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content>
        <p class="reset-hint">Reset password for <strong>{{ data.user.userName }}</strong>.</p>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New Password</mat-label>
          <input matInput type="password" formControlName="newPassword" required />
          <mat-error *ngIf="form.controls.newPassword.hasError('required')">
            New password is required
          </mat-error>
          <mat-error *ngIf="form.controls.newPassword.hasError('minlength')">
            Password must be at least 6 characters
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirm Password</mat-label>
          <input matInput type="password" formControlName="confirmPassword" required />
          <mat-error *ngIf="form.controls.confirmPassword.hasError('required')">
            Confirmation is required
          </mat-error>
          <mat-error *ngIf="form.hasError('passwordsMismatch')">
            Passwords do not match
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
          Update Password
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .reset-password-form {
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

      .reset-hint {
        margin: 0;
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
  ],
})
export class UserRoleResetPasswordDialogComponent {
  readonly form = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator }
  );

  constructor(
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<
      UserRoleResetPasswordDialogComponent,
      UserRoleResetPasswordDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public readonly data: UserRoleResetPasswordDialogData
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword } = this.form.value;
    this.dialogRef.close({
      id: this.data.user.id,
      payload: { newPassword: newPassword! },
    });
  }
}
