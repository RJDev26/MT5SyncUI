import { Menu } from '../models/menu.model';

export const verticalMenuItems = [
    new Menu (1, 'Dashboard', '/', null, 'dashboard', null, false, 0),
    new Menu (214, 'Live Deals', '/deals-live', null, 'sync_alt', null, false, 0),
    new Menu (215, 'Live Orders', '/live-orders', null, 'list_alt', null, false, 0),
    new Menu (216, 'Jobbing Deals', '/jobbing-deals', null, 'history', null, false, 0),
    new Menu (220, 'Standing', '/standing', null, 'bar_chart', null, false, 0),
    new Menu (217, 'Manager Master', '/manager-master', null, 'supervisor_account', null, false, 0),
    new Menu (218, 'Broker Master', '/broker-master', null, 'people', null, false, 0),
    new Menu (219, 'Client Master', '/client-master', null, 'person', null, false, 0)
]

export const horizontalMenuItems = [
    new Menu (1, 'Dashboard', '/', null, 'dashboard', null, false, 0),
    new Menu (214, 'Live Deals', '/deals-live', null, 'sync_alt', null, false, 0),
    new Menu (215, 'Live Orders', '/live-orders', null, 'list_alt', null, false, 0),
    new Menu (216, 'Jobbing Deals', '/jobbing-deals', null, 'history', null, false, 0),
    new Menu (220, 'Standing', '/standing', null, 'bar_chart', null, false, 0),
    new Menu (217, 'Manager Master', '/manager-master', null, 'supervisor_account', null, false, 0),
    new Menu (218, 'Broker Master', '/broker-master', null, 'people', null, false, 0),
    new Menu (219, 'Client Master', '/client-master', null, 'person', null, false, 0)
]
