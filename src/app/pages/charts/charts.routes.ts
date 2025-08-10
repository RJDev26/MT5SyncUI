import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'bar', pathMatch: 'full' },
    { path: 'bar', loadComponent: () => import('./bar/bar.component').then(c => c.BarComponent), data: { breadcrumb: 'Bar Charts' } },
    { path: 'pie', loadComponent: () => import('./pie/pie.component').then(c => c.PieComponent), data: { breadcrumb: 'Pie Charts' } },
    { path: 'line', loadComponent: () => import('./line/line.component').then(c => c.LineComponent), data: { breadcrumb: 'Line Charts' } },
    { path: 'bubble', loadComponent: () => import('./bubble/bubble.component').then(c => c.BubbleComponent), data: { breadcrumb: 'Bubble Charts' } }
];
