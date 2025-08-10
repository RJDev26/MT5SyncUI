import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'autocomplete', pathMatch: 'full' },
    { path: 'autocomplete', loadComponent: () => import('./autocomplete/autocomplete.component').then(c => c.AutocompleteComponent), data: { breadcrumb: 'Autocomplete' } },
    { path: 'checkbox', loadComponent: () => import('./checkbox/checkbox.component').then(c => c.CheckboxComponent), data: { breadcrumb: 'Checkbox' } },
    { path: 'datepicker', loadComponent: () => import('./datepicker/datepicker.component').then(c => c.DatepickerComponent), data: { breadcrumb: 'Datepicker' } },
    { path: 'form-field', loadComponent: () => import('./form-field/form-field.component').then(c => c.FormFieldComponent), data: { breadcrumb: 'Form Field' } },
    { path: 'input', loadComponent: () => import('./input/input.component').then(c => c.InputComponent), data: { breadcrumb: 'Input' } },
    { path: 'radio-button', loadComponent: () => import('./radio-button/radio-button.component').then(c => c.RadioButtonComponent), data: { breadcrumb: 'Radio Button' } },
    { path: 'select', loadComponent: () => import('./select/select.component').then(c => c.SelectComponent), data: { breadcrumb: 'Select' } },
    { path: 'slider', loadComponent: () => import('./slider/slider.component').then(c => c.SliderComponent), data: { breadcrumb: 'Slider' } },
    { path: 'slide-toggle', loadComponent: () => import('./slide-toggle/slide-toggle.component').then(c => c.SlideToggleComponent), data: { breadcrumb: 'Slide Toggle' } }
];
