import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-form-field',
    imports: [
        ReactiveFormsModule,
        FlexLayoutModule,
        MatCardModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatRadioModule,
        MatIconModule
    ],
    templateUrl: './form-field.component.html'
})
export class FormFieldComponent {
  options: FormGroup;
  email = new FormControl('', [Validators.required, Validators.email]);
  hide: boolean = true;
  themingForm: FormGroup;

  constructor(public formBuilder: FormBuilder) { }

  ngOnInit() {
    this.options = this.formBuilder.group({
      hideRequired: false,
      floatLabel: 'auto',
    });
    this.themingForm = this.formBuilder.group({
      'color': 'primary',
      'fontSize': [16, Validators.min(10)],
    });
  }

  getErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
      this.email.hasError('email') ? 'Not a valid email' :
        '';
  }

  getFontSize() {
    return Math.max(10, this.themingForm.value.fontSize);
  }

}
