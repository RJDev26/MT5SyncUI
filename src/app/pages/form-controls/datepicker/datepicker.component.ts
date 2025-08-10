import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
    selector: 'app-datepicker',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatButtonModule,
        NgScrollbarModule
    ],
    templateUrl: './datepicker.component.html',
    styleUrl: './datepicker.component.scss'
})
export class DatepickerComponent {
  //Datepicker start date
  startDate = new Date(1990, 0, 1);

  //Datepicker with min & max validation
  minDate = new Date(2010, 0, 1);
  maxDate = new Date(2020, 0, 1);

  //Datepicker with filter validation 
  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0 && day !== 6;
  }

  //Datepicker input and change events
  events: string[] = [];
  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.events.push(`${type}: ${event.value}`);
  }
}
