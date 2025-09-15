
/**
 * @file cart.routes.ts
 * @Version 5.0.0 (Resolver Re-instated)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-18
 * @Description
 *   Defines the routes for the Cart feature. The cartInitResolver is re-instated
 *   to ensure the cart hydration process is triggered *before* the component activates,
 *   allowing the new `loadMissingProducts$` effect to resolve the hydration gap.
 */
import { Route } from '@angular/router';
import { CartDetailPageComponent } from './lib/pages/cart-detail-page/cart-detail-page.component';
import { cartInitResolver } from './lib/resolvers/cart-init.resolver';

export const CartFeatureRoutes: Route[] = [
  {
    path: '',
    component: CartDetailPageComponent,
    resolve: {
      cartInitialized: cartInitResolver
    }
  },
];