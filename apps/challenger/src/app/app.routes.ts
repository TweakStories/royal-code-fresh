/**
 * @file app.routes.ts
 * @version 2.0.0 (Cleaned Providers)
 * @description Defines the main application routes. All NgRx feature state
 *              is provided globally in app.config.ts. This file contains
 *              NO NgRx providers to prevent duplication and state loss.
 */
import { Route } from '@angular/router';

// Importeer componenten
import { LoginComponent } from '@royal-code/features/authentication';
import { HomeComponent } from './features/home/home.component';
// Importeer guards indien nodig
// import { authGuard } from '@royal-code/features/authentication';

export const appRoutes: Route[] = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: HomeComponent,
    title: 'Home',
  },
  {
    path: 'products',
    // canActivate: [authGuard],
    loadChildren: () =>
      import('@royal-code/features/products/ui-plushie').then(
        (m) => m.ProductsFeatureRoutes
      ),
    title: 'Products',
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('@royal-code/features/cart/ui-plushie').then((m) => m.CartFeatureRoutes),
    title: 'Cart',
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('@royal-code/features/checkout/ui-plushie').then((m) => m.CheckoutRoutes),
    title: 'Checkout',
  },
  {
    path: 'chat',
    loadChildren: () => import('@royal-code/features/chat/ui-plushie').then(m => m.ChatPlushieRoutes)
  },
];
