import { Routes } from '@angular/router';;
import { PageNotFound } from './page-not-found/page-not-found';
import { Error } from './page-error/error';

export const routes: Routes = [
{
    path: 'home',
    title: 'home-UldeModel-v1',
    loadComponent:  () => import('./app').then(m => m.App)
  },
  {
    path: "fallback",
    title: "Page Not Found",
    component: PageNotFound
  },
  {
    path: 'error',
    title: 'Error on Page',
    component: Error
  },
    {
    path: '',
    redirectTo: "home",
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: "fallback"
  }
];
