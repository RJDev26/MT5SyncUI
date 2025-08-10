import { Component, OnInit } from '@angular/core';
import { DynamicMenuService } from '@services/dynamic-menu.service';
import { MenuService } from '@services/menu.service';
import { listTransition } from '../../theme/utils/app-animation';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VerticalMenuComponent } from '../../theme/components/menu/vertical-menu/vertical-menu.component';
import { Menu } from '../../common/models/menu.model';
import { debounceTime } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

@Component({
    selector: 'app-dynamic-menu',
    imports: [
        ReactiveFormsModule,
        FlexLayoutModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatRadioModule
    ],
    templateUrl: './dynamic-menu.component.html',
    styleUrl: './dynamic-menu.component.scss',
    providers: [DynamicMenuService, MenuService],
    animations: [listTransition],
    host: {
        '[@listTransition]': ''
    }
})
export class DynamicMenuComponent implements OnInit { 
  public menuItems: Array<Menu>;
  public icons = ['home','person', 'card_travel', 'delete', 'event', 'favorite', 'help' ]
  public form: FormGroup;
  constructor(public formBuilder: FormBuilder, 
              public snackBar: MatSnackBar,
              private menuService: MenuService,
              private dynamicMenuService: DynamicMenuService) { 
    this.menuItems = this.menuService.getVerticalMenuItems();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      'title': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'icon': null,
      'routerLink': ['', Validators.required],    
      'href': ['', Validators.required],            
      'target': null,
      'hasSubMenu': false,
      'parentId': 0
    });
  }

  ngAfterViewInit() {
    this.form.valueChanges.pipe(debounceTime(500)).subscribe((menu:Menu) => {  
      if(menu.routerLink && menu.routerLink != ''){
        this.form.controls['href'].setValue(null);
        this.form.controls['href'].disable();
        this.form.controls['href'].clearValidators();
        this.form.controls['target'].setValue(null);
        this.form.controls['target'].disable();
      }
      else{
        this.form.controls['href'].enable();
        this.form.controls['href'].setValidators([Validators.required]);
        this.form.controls['target'].enable();
      }
      this.form.controls['href'].updateValueAndValidity();

      if(menu.href && menu.href != ''){
        this.form.controls['routerLink'].setValue(null);
        this.form.controls['routerLink'].disable();
        this.form.controls['routerLink'].clearValidators();
        this.form.controls['hasSubMenu'].setValue(false);
        this.form.controls['hasSubMenu'].disable();
      }
      else{
        this.form.controls['routerLink'].enable();
        this.form.controls['routerLink'].setValidators([Validators.required]);
        this.form.controls['hasSubMenu'].enable();
      }
      this.form.controls['routerLink'].updateValueAndValidity();
    })
  }

  onSubmit(menu: Menu): void {
    if (this.form.valid) {
      this.dynamicMenuService.addNewMenuItem(VerticalMenuComponent, this.menuItems, menu);
      this.snackBar.open('New menu item added successfully!', undefined, {
        duration: 2000,
      });
      this.form.reset({
        hasSubMenu:false,
        parentId:0
      });     
    }
  } 

}
