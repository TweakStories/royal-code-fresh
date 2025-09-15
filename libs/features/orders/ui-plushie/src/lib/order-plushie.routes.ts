/**
 * @file order-plushie.routes.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-07-19
 * @Description Definieert de lazy-loaded routes voor de 'Mijn Bestellingen' feature.
 *              Het voorziet ook de benodigde NgRx state en effects via provideOrdersFeature.
 */
import { Routes } from '@angular/router';
import { provideOrdersFeature } from '@royal-code/features/orders/core';

export const OrderPlushieRoutes: Routes = [
  {
    path: '',
    // Registreer de NgRx state & effects specifiek voor deze lazy-loaded feature
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/order-history-page/order-history-page.component').then(
            (m) => m.OrderHistoryPageComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/order-detail-page/order-detail-page.component').then(
            (m) => m.OrderDetailPageComponent
          ),
      },
    ],
  },
];