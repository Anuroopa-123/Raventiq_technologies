import { Routes } from '@angular/router';
import { guestGuard, roleGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', title: 'Raventiq | Code. Grow. Uplift.', loadComponent: () => import('./pages/home').then((m) => m.HomePage) },
  { path: 'login', title: 'Log in | Raventiq', canActivate: [guestGuard], loadComponent: () => import('./pages/login').then((m) => m.LoginPage) },
  { path: 'register', title: 'Register | Raventiq', canActivate: [guestGuard], loadComponent: () => import('./pages/register').then((m) => m.RegisterPage) },
  { path: 'admin', title: 'Admin | Raventiq', canActivate: [roleGuard('admin', 'superadmin')], loadComponent: () => import('./pages/admin-dashboard').then((m) => m.AdminDashboardPage) },
  { path: 'superadmin', title: 'Owner | Raventiq', canActivate: [roleGuard('superadmin')], loadComponent: () => import('./pages/superadmin-dashboard').then((m) => m.SuperadminDashboardPage) },
  { path: '**', redirectTo: '' },
];
