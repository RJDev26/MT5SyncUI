import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'reports', pathMatch: 'full'},
    { path: 'trail-balance', loadComponent: () => import('./trail-balance/trail-balance.component').then(c => c.TrailBalanceComponent), data: { breadcrumb: 'Trail Balance' } },
    { path: 'general-ledger', loadComponent: () => import('./ledger-report/ledger-report.component').then(c => c.LedgerReportComponent), data: { breadcrumb: 'General Ledger' } },
    { path: 'standing-statement', loadComponent: () => import('./standing-statement/standing-statement.component').then(c => c.StandingStatementComponent), data: { breadcrumb: 'Standing Statement' } },
    { path: 'live-bill-summary', loadComponent: () => import('./live-bill-summary/live-bill-summary.component').then(c => c.LiveBillSummaryComponent), data: { breadcrumb: 'Live Bill Summary' } }
]
