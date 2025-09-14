import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Settings, SettingsService } from '@services/settings.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthenticationService } from '@services/authentication.service';

@Component({
    selector: 'app-login',
    imports: [
        RouterModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatSidenavModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
      ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
  })
  export class LoginComponent {
    public form: FormGroup;
    public settings: Settings;
    public hide = true;
  constructor(public settingsService: SettingsService, public fb: FormBuilder, public router: Router, private authService: AuthenticationService){
    this.settings = this.settingsService.settings;
    this.form = this.fb.group({
      'userName': [null, Validators.compose([Validators.required])],
      'password': [null, Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  public onSubmit(values: Object): void {
    if (this.form.valid)
    {
      const login = { ...this.form.value };
      this.authService.Login(login)
        .subscribe({
          next: (res: any) => {
            console.log("res", res);
            localStorage.setItem("token", res.token);
            localStorage.setItem("userData", JSON.stringify(res));
            this.authService.sendAuthStateChangeNotification(res.isAuthSuccessful);
            this.authService.saveUserData(res);
            this.router.navigate(['/deals-live']);
          },
          error: (err: any) => {
            console.log('err', err);
          }
        })
    }
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.settings.loadingSpinner = false; 
    });  
  }
}
