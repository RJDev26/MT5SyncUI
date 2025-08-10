import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { DragulaModule } from 'ng2-dragula';

@Component({
    selector: 'app-drag-drop',
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatIconModule,
        DragulaModule
    ],
    templateUrl: './drag-drop.component.html',
    styleUrl: './drag-drop.component.scss'
})
export class DragDropComponent {
  public icons = [ "home", "person", "alarm", "work", "mail", "favorite"];
  public colors = [ "accent", "primary", "warn" ]; 
}
