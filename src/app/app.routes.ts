import { Routes } from '@angular/router';;
import { PageNotFound } from './page-not-found/page-not-found';
import { Error } from './page-error/error';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'configure',
    pathMatch: 'full'
  },

  {
    path: 'configure',
    loadChildren: () =>
      import('./product-configurator/product-configurator.routes')
        .then(m => m.PRODUCT_CONFIGURATOR_ROUTES)
  },

  {
    path: 'docs',
    loadChildren: () =>
      import('./docs-viewer/docs-viewer.routes')
        .then(m => m.DOCS_VIEWER_ROUTES)
  },

  {
    path: 'viewer-demo',
    loadComponent: () =>
      import('./ulde-viewer/ulde-viewer')
        .then(m => m.UldeViewer)
  },

  {
    path: '**',
    redirectTo: 'configure'
  }
];

// export const routes: Routes = [
// {
//     path: 'home',
//     title: 'home-UldeModel-v1',
//     loadComponent:  () => import('./app').then(m => m.App)
//   },
//   {
//     path: "fallback",
//     title: "Page Not Found",
//     component: PageNotFound
//   },
//   {
//     path: 'error',
//     title: 'Error on Page',
//     component: Error
//   },
//     {
//     path: '',
//     redirectTo: "home",
//     pathMatch: 'full'
//   },
//   {
//     path: '**',
//     redirectTo: "fallback"
//   }
// ];
