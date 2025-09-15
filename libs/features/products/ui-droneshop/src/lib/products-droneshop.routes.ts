/**
 * @file products.routes.ts
 * @Version 3.0.0 (Resolver Integration for Filter Synchronization)
 */
import { Routes } from '@angular/router';
import { provideReviewsFeature } from '@royal-code/features/reviews/core';
import { provideProductsFeature } from '@royal-code/features/products/core';
import { productDetailResolver } from './resolvers/product-detail.resolver';
import { productFiltersResolver } from './resolvers/product-filters.resolver'; // ADD

export const ProductsFeatureRoutes: Routes = [
  {
    path: '',
    providers: [
      provideProductsFeature(),
      provideReviewsFeature()
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/shop-page/shop-page.component').then(m => m.ShopPageComponent),
        resolve: {
          filters: productFiltersResolver // ADD
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange', // ADD
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
        resolve: {
          productData: productDetailResolver
        }
      }
    ]
  }
];