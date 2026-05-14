// product-configurator/product-configurator.routes.ts

import { Routes } from '@angular/router';
import { ProductConfigurator } from './product-configurator';

export const PRODUCT_CONFIGURATOR_ROUTES: Routes = [
  {
    path: '',
    component: ProductConfigurator
  }
];

