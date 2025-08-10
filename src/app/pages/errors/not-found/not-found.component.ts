import { Component } from '@angular/core';
import { Settings, SettingsService } from '../../../services/settings.service';
import { Router, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-not-found',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
    ],
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  public settings: Settings;
  constructor(public settingsService: SettingsService, public router: Router) {
    this.settings = this.settingsService.settings;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.settings.loadingSpinner = false;
    });
  }
}
