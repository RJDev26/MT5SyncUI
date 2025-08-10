import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-schedule-dialog',
    imports: [
        ReactiveFormsModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDialogModule,
        MatButtonModule
    ],
    templateUrl: './schedule-dialog.component.html'
})
export class ScheduleDialogComponent implements OnInit {
  public form: FormGroup;
  constructor(public dialogRef: MatDialogRef<ScheduleDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({ 
      'title': ['', Validators.required],            
      'start': ['', Validators.required], 
      'end': '',
      'isEdit' : false
    });
  }

  ngOnInit() {
    if (this.data){
      this.form.patchValue({
        'title': this.data.title,
        'start': this.data.start,
        'end': this.data.end,
        'isEdit' : true
      })
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}
