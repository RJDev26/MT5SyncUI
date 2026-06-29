import { Component, OnInit, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router'; 
import { MatMenuTrigger } from '@angular/material/menu';
import { MenuService } from '../../../../services/menu.service';
import { Settings, SettingsService } from '../../../../services/settings.service';
import { AuthenticationService } from '@services/authentication.service';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-horizontal-menu',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    templateUrl: './horizontal-menu.component.html',
    styleUrls: ['./horizontal-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HorizontalMenuComponent implements OnInit {
  @Input('menuParentId') menuParentId: any;
  public menuItems: Array<any>;
  public settings: Settings;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  constructor(public settingsService: SettingsService, public menuService: MenuService, public router:Router, private authenticationService: AuthenticationService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.authenticationService.getUserData().subscribe(data => {
      const role = data?.role || (Array.isArray(data?.roles) ? data.roles[0] : null);
      const filtered = this.menuService.filterMenuItemsForRole(this.menuService.getHorizontalMenuItems(), role);
      this.menuItems = filtered.filter(item => item.parentId == this.menuParentId);
    });
  }

  ngAfterViewInit(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const mainContent = document.getElementById('main-content');
        if(mainContent){
          mainContent.scrollTop = 0;
        }
      }
    });
  }

}
