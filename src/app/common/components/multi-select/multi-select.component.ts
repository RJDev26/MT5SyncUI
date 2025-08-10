import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  forwardRef,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { Observable, of } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  imports: [
    MatSelectModule,
    ScrollingModule,
    CommonModule,
    MatOptionModule,
    MatIconModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
        MatInputModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent implements OnInit, OnChanges, ControlValueAccessor {
  @ViewChild('search') searchTextBox: ElementRef;
  @ViewChild('selectAccount') selectAccount: MatSelect;
  @Input() labelName: string = 'Select Account';
  @Input() dataList: any[] = [];
  @Input() showSelectAllFn: boolean = true;
  @Input() labelKey: string = 'name';
  @Output() onSelectionChange: EventEmitter<any> = new EventEmitter();
  isVirtualScrollOn: boolean = false;

  selectFormControl = new FormControl();
  searchTextboxControl = new FormControl();
  selectedValues: any[] = [];
  allSelected = false;
  filteredOptions: Observable<any[]>;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.setFilterValue();
    this.selectFormControl.valueChanges.subscribe((value) => {
      this.selectedValues = value;
      this.onChange(value);
    });
  }

  setFilterValue() {
    this.filteredOptions = this.searchTextboxControl.valueChanges.pipe(
      debounceTime(500),
      startWith<string>(''),
      map((name) => this._filter(name)),
      startWith([])
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataList && changes.dataList.currentValue) {
      this.setFilterValue();
    }
  }

  showSelectAllFnClass() {
    return this.showSelectAllFn ? '' : 'select-all-option-hide';
  }

  private _filter(name: string): any[] {
    try{
      const filterValue = name.toLowerCase();
      // this.setSelectedValues();
      this.selectFormControl.patchValue(this.selectedValues);
      return this.dataList?.filter((option) =>
        option[this.labelKey]?.toLowerCase().includes(filterValue)
    ) || [];
  } catch(e) {
    console.log('e', e);
    return [];
  }
  }

  selectionChange(event: any) {
    if (event.isUserInput) {
      this.updateSelectedValues(event.source.value, event.source.selected);
    }
  }

  updateSelectedValues(value: any, isSelected: boolean) {
    if (isSelected) {
      if (!this.selectedValues.includes(value)) {
        this.selectedValues.push(value);
      }
    } else {
      const index = this.selectedValues.indexOf(value);
      if (index >= 0) {
        this.selectedValues.splice(index, 1);
      }
    }

    this.selectFormControl.setValue(this.selectedValues, { emitEvent: false });
    this.cdr.detectChanges(); // Manually trigger change detection
  }

  openedChange(e: any) {
    this.searchTextboxControl.patchValue('');
    if (e) {
      this.setFilterValue();
      this.searchTextBox.nativeElement.focus();
    } else {
      this.filteredOptions = of(this.selectFormControl.value);
      this.onSelectionChange.emit(this.selectedValues);
    }
  }

  clearSearch(event: any) {
    event.stopPropagation();
    this.searchTextboxControl.patchValue('');
  }

  writeValue(value: any): void {
    this.selectedValues = value || [];
    this.selectFormControl.setValue(this.selectedValues, { emitEvent: false });
    this.cdr.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  getOptionsString(option: any): string {
    return option[this.labelKey] || 'Key Invalid';
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.selectFormControl.disable();
    } else {
      this.selectFormControl.enable();
    }
  }

  setSelectedValues() {
    if (
      this.selectFormControl.value &&
      this.selectFormControl.value.length > 0
    ) {
      this.selectFormControl.value.forEach((e: any) => {
        if (this.selectedValues.indexOf(e) == -1) {
          this.selectedValues.push(e);
        }
      });
    }
  }

  toggleSelectAll() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectFormControl.setValue(this.dataList);
    } else {
      this.selectedValues = [];
      this.selectFormControl.setValue([]);
    }
    this.onSelectionChange.emit(this.selectFormControl.value);
  }
}
