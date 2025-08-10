import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Settings, SettingsService } from './services/settings.service';
import { NgClass } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        NgClass,
        MatProgressSpinnerModule
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  settingsService = inject(SettingsService);
  settings: Settings = this.settingsService.settings;
}
