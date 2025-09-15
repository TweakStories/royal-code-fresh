/**
 * @file products-plushie.routes.ts
 * @Path libs/features/products/ui-plushie/src/products-plushie.routes.ts
 * @Version 5.0.0 (Corrected State Provisioning)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description Defines the Angular routes for the Products feature.
 *              This version FIXES the "Action types are registered more than once" error
 *              by REMOVING the redundant `provideReviewsFeature()` call. The reviews state
 *              is already provided eagerly in the root `app.config.ts` and does not
 *              need to be re-provided here.
 */
import { Routes } from '@angular/router';

export const ProductsFeatureRoutes: Routes = [
  {
    path: '',
    // De 'providers' array is hier verwijderd. De benodigde states (zoals Reviews)
    // zijn al globaal beschikbaar omdat ze in app.config.ts worden voorzien.
    children: [
      {
        path: '',
        loadComponent: () => import('./lib/pages/shop-page/shop-page.component').then(m => m.ShopPageComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./lib/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
      },
    ],
  },
];