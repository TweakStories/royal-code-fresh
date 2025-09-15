/**
 * @file product-cart.initializer.ts
 * @Version 1.0.0 (Cross-Feature Initializer)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-11
 * @Description
 *   A cross-feature APP_INITIALIZER that coordinates between cart and products modules.
 *   This initializer preloads product data for items in the cart, breaking the circular
 *   dependency between cart-core and products-core by placing the initialization logic
 *   in a neutral shared location.
 */
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { take, map, catchError, of, withLatestFrom } from 'rxjs';
import { selectAllCartItems } from '@royal-code/features/cart/core';
import { selectProductEntities, ProductActions } from '@royal-code/features/products/core';
import { LoggerService } from '@royal-code/core/core-logging';
import { Product, isPhysicalProduct } from '@royal-code/features/products/domain';

export function initializeProductCartData(): () => Promise<boolean> {
  const store = inject(Store);
  const logger = inject(LoggerService);
  const M = '[ProductCartInitializer]';

  return () => new Promise(resolve => {
    store.select(selectAllCartItems).pipe(
      take(1),
      withLatestFrom(store.select(selectProductEntities)),
      map(([items, productEntities]) => {
        const productIdsInCart = [...new Set(items.map((item: any) => item.productId).filter(Boolean))] as string[];
        const missingDetailProductIds = productIdsInCart.filter(id => {
          const productInStore = (productEntities as any)[id];
          return !productInStore || !isProductDetailComplete(productInStore);
        });

        return missingDetailProductIds;
      }),
      catchError(err => {
        logger.error(`${M} Error during initial product data check. Preload skipped.`, err);
        return of([]); // Return empty array to not break the flow.
      })
    ).subscribe(idsToLoad => {
      if (idsToLoad.length > 0) {
        logger.info(`${M} Cart contains items with missing product data. Dispatching 'loadProductsByIds' for ${idsToLoad.length} products.`);
        store.dispatch(ProductActions.loadProductsByIds({ ids: idsToLoad }));
      } else {
        logger.info(`${M} All product data for cart items is already present in the state. No preload needed.`);
      }
      // Always resolve immediately. Components must handle loading state themselves.
      resolve(true); 
    });
  });
}

// Helper function to check if a product can be considered 'detail complete'.
function isProductDetailComplete(p: Product | undefined): p is Product {
  if (!p) return false;
  if (isPhysicalProduct(p)) {
    return Array.isArray(p.displaySpecifications);
  }
  return !!p.description;
}