import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '@services/authentication.service';

@Component({
    selector: 'app-user-menu',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule
    ],
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UserMenuComponent implements OnInit {
  public userName: string = '';
  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
    this.authService.getUserData().subscribe(data => {
      this.userName = data?.name || data?.userName || '';
    });
  }

}
