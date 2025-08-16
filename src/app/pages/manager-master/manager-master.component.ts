import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MasterService, MasterItem } from '@services/master.service';

@Component({
  selector: 'app-manager-master',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './manager-master.component.html',
  styleUrls: ['./manager-master.component.scss'],
})
export class ManagerMasterComponent {
  displayedColumns = ['code', 'name', 'actions'];
  dataSource: MasterItem[] = [];

  constructor(private svc: MasterService, private dialog: MatDialog) {
    this.load();
  }

  load() {
    this.svc.getManagers().subscribe(res => (this.dataSource = res));
  }

  openDialog(item?: MasterItem) {
    const dialogRef = this.dialog.open(ManagerDialogComponent, {
      data: item ? { ...item } : { id: 0, code: '', name: '' },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.svc.saveManager(result).subscribe(() => this.load());
      }
    });
  }

  delete(id: number) {
    this.svc.deleteManager(id).subscribe(() => this.load());
  }
}

@Component({
  selector: 'app-manager-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.id ? 'Edit' : 'Add' }} Manager</h2>
    <div mat-dialog-content>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Code</mat-label>
        <input matInput [(ngModel)]="data.code" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="data.name" />
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="data">Save</button>
    </div>
  `,
})
export class ManagerDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}

