import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { Settings, SettingsService } from '@services/settings.service';

@Component({
    selector: 'app-landing',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatButtonModule
    ],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss'
})
export class LandingComponent {
  public settings: Settings;
  constructor(public settingsService: SettingsService) {
    this.settings = this.settingsService.settings; 
  }

  ngOnInit(){
    this.settings.rtl = false;
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.settings.loadingSpinner = false; 
    });
  }

  public scrollToDemos(){
    setTimeout(() => { window.scrollTo(0,520) });
  }

  public changeLayout(menu: any, menuType: any, isRtl: boolean){
    this.settings.menu = menu;
    this.settings.menuType = menuType;
    this.settings.rtl = isRtl;
    this.settings.theme = 'black-dashboard';
  }

  public changeTheme(theme: string){
    this.settings.theme = theme;       
  }

}
