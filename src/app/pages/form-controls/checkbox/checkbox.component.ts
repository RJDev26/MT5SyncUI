import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';

@Component({
    selector: 'app-checkbox',
    imports: [
        FormsModule,
        MatCardModule,
        MatCheckboxModule,
        MatRadioModule,
        MatDividerModule
    ],
    templateUrl: './checkbox.component.html'
})
export class CheckboxComponent {
  checked = false;
  indeterminate = false;
  labelPosition: "before" | "after" = 'after';
  disabled = false;
}
