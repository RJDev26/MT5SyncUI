import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { Observable, map, startWith } from 'rxjs';

@Component({
    selector: 'app-autocomplete',
    imports: [
        AsyncPipe,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatCardModule,
        MatInputModule,
        MatAutocompleteModule
    ],
    templateUrl: './autocomplete.component.html'
})
export class AutocompleteComponent {
  myControl: FormControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three']; 
  filteredControl: FormControl = new FormControl();
  filteredOptions: Observable<string[]>;
   
  constructor() { } 
  
  ngOnInit() {
    this.filteredOptions = this.filteredControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

}
