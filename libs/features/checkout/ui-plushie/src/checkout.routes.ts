/**
 * @file checkout.routes.ts
 * @Version 5.0.0 (i18n Resolver Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Defines the lazy-loaded routes for the Checkout feature. This version integrates
 *   the `i18nInitResolver` to ensure translations are loaded before activating
 *   the checkout pages, resolving missing translation issues.
 */
import { Route } from '@angular/router';
import { provideCheckoutFeature } from '@royal-code/features/checkout/core';
import { i18nInitResolver } from '@royal-code/shared/utils'; // <<< TOEGEVOEGD

export const CheckoutRoutes: Route[] = [
  {
    path: '',
    // PROVIDE de state en effects voor deze lazy-loaded feature.
    providers: [
      provideCheckoutFeature()
    ],
    // CRUCIAAL: Pas de i18n resolver toe op dit lazy-loaded blok
    resolve: {
      i18n: i18nInitResolver
    },
    children: [
      {
        path: '',
        loadComponent: () => import('./lib/pages/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent),
      },
      {
        path: 'success/:id',
        loadComponent: () => import('./lib/pages/order-success-page/order-success-page.component').then(m => m.OrderSuccessPageComponent),
      },
    ]
  },
];