import { Routes } from '@angular/router';
import { PagesComponent } from './pages.component';

export const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
        data: { breadcrumb: 'Dashboard' }
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(c => c.UsersComponent),
        data: { breadcrumb: 'Users' }
      },
     
      {
        path: 'dynamic-menu',
        loadComponent: () => import('./dynamic-menu/dynamic-menu.component').then(c => c.DynamicMenuComponent),
        data: { breadcrumb: 'Dynamic Menu' }
      },
     
      {
        path: 'form-controls',
        loadChildren: () => import('./form-controls/form-controls.routes').then(p => p.routes),
        data: { breadcrumb: 'Form Controls' }
      },
      
      { 
        path: 'profile', 
        loadChildren: () => import('./profile/profile.routes').then(p => p.routes),
        data: { breadcrumb: 'Profile' } 
      },
      {
        path: 'schedule',
        loadComponent: () => import('./schedule/schedule.component').then(c => c.ScheduleComponent),
        data: { breadcrumb: 'Schedule' }
      },
      
      {
        path: 'charts',
        loadChildren: () => import('./charts/charts.routes').then(p => p.routes),
        data: { breadcrumb: 'Charts' }
      },
      {
        path: 'drag-drop',
        loadComponent: () => import('./drag-drop/drag-drop.component').then(c => c.DragDropComponent),
        data: { breadcrumb: 'Drag & Drop' }
      },

      {
        path: 'deals-live',
        loadComponent: () => import('./deals-live/deals-live.component').then(c => c.DealsLiveComponent),
        data: { breadcrumb: 'Live Deals' }
      },
      {
        path: 'live-orders',
        loadComponent: () => import('./live-orders/live-orders.component').then(c => c.LiveOrdersComponent),
        data: { breadcrumb: 'Live Orders' }
      },
      {
        path: 'jobbing-deals',
        loadComponent: () => import('./jobbing-deals/jobbing-deals.component').then(c => c.JobbingDealsComponent),
        data: { breadcrumb: 'Jobbing Deals' }
      },


    ]
  }
];
