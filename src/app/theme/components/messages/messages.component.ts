import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MessagesService } from './messages.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatCardModule } from '@angular/material/card';
import { SlicePipe } from '@angular/common';

@Component({
    selector: 'app-messages',
    imports: [
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatCardModule,
        MatMenuModule,
        NgScrollbarModule,
        SlicePipe
    ],
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [MessagesService]
})
export class MessagesComponent implements OnInit {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  public messages:Array<any>;
  constructor(private messagesService:MessagesService) {
    this.messages = messagesService.getMessages();
  }

  ngOnInit() {
  }

  openMessagesMenu() {
    this.trigger.openMenu();
  }

  onMouseLeave(){
    this.trigger.closeMenu();
  }

  stopClickPropagate(event: any){
    event.stopPropagation();
    event.preventDefault();
  }

}
