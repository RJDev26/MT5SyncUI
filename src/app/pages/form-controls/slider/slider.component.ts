import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';

@Component({
    selector: 'app-slider',
    imports: [
        FormsModule,
        MatCardModule,
        MatInputModule,
        MatCheckboxModule,
        MatSliderModule,
        MatDividerModule
    ],
    templateUrl: './slider.component.html',
    styleUrl: './slider.component.scss'
})
export class SliderComponent {
  disabled = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value = 0;
}
