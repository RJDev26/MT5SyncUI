import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'bill-sum-sharing', pathMatch: 'full'},
    { path: 'bill-sum-sharing', loadComponent: () => import('./billsum-sharing/billsum-sharing.component').then(c => c.BillsumSharingComponent), data: { breadcrumb: 'Bill Summary with sharing' } }
];
