import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';

export const routes: Routes = [
  {
    path: '',
    component: LoginPage,
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'ticket-up',
    loadComponent: () => import('./pages/ticket-up/ticket-up.page').then( m => m.TicketUpPage)
  },
];
