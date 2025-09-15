/**
 * @file product-state.initializer.ts
 * @Version 8.0.0 (Non-Blocking APP_INITIALIZER for Hydration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   A definitive, NON-BLOCKING, and universal APP_INITIALIZER for product data.
 *   This version ensures that the initializer ALWAYS RESOLVES IMMEDIATELY, preventing
 *   it from blocking Angular hydration. It still dispatches actions to pre-load
 *   product data for cart items, but components must handle the loading state themselves.
 *   This resolves `NG0506` hydration timeouts caused by blocking initializers.
 */
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { take, map, catchError, of, filter, withLatestFrom } from 'rxjs';
import { selectAllCartItems } from '@royal-code/features/cart/core';
import { LoggerService } from '@royal-code/core/logging';
import { Product } from '@royal-code/features/products/domain';
import { isPhysicalProduct } from '../utils/product-type-guards';
import { ProductActions } from '../state/product.actions';
import { selectProductEntities } from '../state/product.feature';

export function initializeProductState(): () => Promise<boolean> {
  const store = inject(Store);
  const logger = inject(LoggerService);
  const M = '[ProductInitializer]';

  return () => new Promise(resolve => {
    store.select(selectAllCartItems).pipe(
      take(1),
      withLatestFrom(store.select(selectProductEntities)),
      map(([items, productEntities]) => {
        const productIdsInCart = [...new Set(items.map(item => item.productId).filter(Boolean))];
        const missingDetailProductIds = productIdsInCart.filter(id => {
          const productInStore = productEntities[id];
          return !productInStore || !isProductDetailComplete(productInStore);
        });

        return missingDetailProductIds;
      }),
      catchError(err => {
        logger.error(`${M} Error during initial product data check. Preload skipped.`, err);
        return of([]); // Geef een lege array terug om de flow niet te breken.
      })
    ).subscribe(idsToLoad => {
      if (idsToLoad.length > 0) {
        logger.info(`${M} Cart contains items with missing product data. Dispatching 'loadProductsByIds' for ${idsToLoad.length} products.`);
        store.dispatch(ProductActions.loadProductsByIds({ ids: idsToLoad }));
      } else {
        logger.info(`${M} All product data for cart items is already present in the state. No preload needed.`);
      }
      // DE FIX: Resolve ALTIJD direct. Components moeten de laadtoestand zelf afhandelen.
      resolve(true); 
    });
  });
}

// Hulpfunctie om te controleren of een product als 'detail compleet' kan worden beschouwd.
function isProductDetailComplete(p: Product | undefined): p is Product {
  if (!p) return false;
  if (isPhysicalProduct(p)) {
    return Array.isArray(p.displaySpecifications);
  }
  return !!p.description;
}