import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'master', pathMatch: 'full'},
    { path: 'account-tax-list', loadComponent: () => import('./account-tax-list/account-tax-list.component').then(c => c.AccountTaxListComponent), data: { breadcrumb: 'Account Tax List' } },
    { path: 'exchange-tax-list', loadComponent: () => import('./exchange-tax-list/exchange-tax-list.component').then(c => c.ExchangeTaxListComponent), data: { breadcrumb: 'Exchange Tax List' } },
    { path: 'brokerage-setup-list', loadComponent: () => import('./brokerage-setup/brokerage-setup.component').then(c => c.BrokerageSetupComponent), data: { breadcrumb: 'Brokerage Setup List' } },
    { path: 'item-master', loadComponent: () => import('./item-master/item-master.component').then(c => c.ItemMasterComponent), data: { breadcrumb: 'Item Master List' } },
    { path: 'sauda-master', loadComponent: () => import('./sauda-master/sauda-master.component').then(c => c.SaudaMasterComponent), data: { breadcrumb: 'Sauda Master List' } },
    { path: 'script-master', loadComponent: () => import('./script-master/script-master.component').then(c => c.ScriptMasterComponent), data: { breadcrumb: 'Script Master List' } },
    { path: 'contract-master', loadComponent: () => import('./contract-master/contract-master.component').then(c => c.contractMasterComponent), data: { breadcrumb: 'Contract Master List' } },
    { path: 'account-list', loadComponent: () => import('./account-list/account-list.component').then(c => c.AccountListComponent), data: { breadcrumb: 'Account List' } }
];
