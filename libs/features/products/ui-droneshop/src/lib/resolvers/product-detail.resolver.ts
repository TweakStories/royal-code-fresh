// --- IN libs/features/products/ui-droneshop/src/lib/resolvers/product-detail.resolver.ts, VERVANG HET BLOK 'productDetailResolver' ---
/**
 * @file product-detail.resolver.ts
 * @Version 4.2.0 (Robuster isProductDetailComplete & Resolver Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Een robuuste resolver die ervoor zorgt dat de productdetailpagina pas wordt geactiveerd
 *   nadat de productgegevens volledig zijn geladen en in de NgRx-store beschikbaar zijn.
 *   De `isProductDetailComplete` is nu strikter en de resolver wacht expliciet totdat
 *   het geselecteerde product overeenkomt met de ID en als 'compleet' wordt beschouwd.
 */
import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, take, map, switchMap, catchError, timeout, tap } from 'rxjs/operators';
import { ProductActions, selectProductById, selectIsLoading, selectSelectedProduct } from '@royal-code/features/products/core';
import { Product, isPhysicalProduct } from '@royal-code/features/products/domain';
import { LoggerService } from '@royal-code/core/core-logging';

export const productDetailResolver: ResolveFn<boolean> = (
  route: ActivatedRouteSnapshot
): Observable<boolean> => {
  const store = inject(Store);
  const logger = inject(LoggerService, { optional: true });
  const productId = route.paramMap.get('id');

  if (!productId) {
    logger?.error('[ProductDetailResolver] No product ID found in route');
    return of(false);
  }

  logger?.info(`[ProductDetailResolver] Resolving product: ${productId}`);

  // Functie om te bepalen of een product voldoende data heeft om te renderen
  const isProductDetailComplete = (p: Product | undefined): p is Product => {
    if (!p) return false;
    // Een product is compleet als het een ID, naam en beschrijving heeft.
    // Voor fysieke producten, controleer ook displaySpecifications en variantAttributes.
    const baseComplete = !!p.id && !!p.name && !!p.description;
    if (isPhysicalProduct(p)) {
      return baseComplete && Array.isArray(p.displaySpecifications) && Array.isArray(p.variantAttributes);
    }
    return baseComplete;
  };

  return store.pipe(
    select(selectProductById(productId)),
    // Tap om te debuggen wat de store initieel geeft
    tap(product => logger?.debug(`[ProductDetailResolver] Initial store check for ${productId}:`, { productExists: !!product, isComplete: isProductDetailComplete(product) })),
    take(1), // Neem de eerste initiële snapshot
    switchMap((initialProductFromStore: Product | undefined) => {
      // Als het product al in de store zit en compleet is, ga direct verder
      if (isProductDetailComplete(initialProductFromStore)) {
        logger?.info(`[ProductDetailResolver] Complete product found in store: ${productId}. No dispatch needed.`);
        // Dispatch toch productSelected om te garanderen dat de `selectedProductId` in de state gezet wordt,
        // ZONDER dat dit een nieuwe API call triggert als het product er al is.
        store.dispatch(ProductActions.productSelected({ id: productId }));
        return of(true);
      }

      // Product is niet (volledig) in de store, dispatch load action
      logger?.info(`[ProductDetailResolver] Product incomplete or not found for ${productId}. Dispatching 'productSelected' to trigger load.`);
      store.dispatch(ProductActions.productSelected({ id: productId }));

      // Wacht op de succesvolle laadactie EN check of het product compleet is EN de ID matcht
      return store.pipe(
        select(selectSelectedProduct), // Luister naar het geselecteerde product
        tap(product => logger?.debug(`[ProductDetailResolver] Observing selectedProduct for ${productId}:`, { productExists: !!product, isComplete: isProductDetailComplete(product), selectedId: product?.id })),
        filter(p => isProductDetailComplete(p) && p?.id === productId),
        take(1),
        timeout(15000), // Max 15 seconden wachten
        map(() => {
          logger?.info(`[ProductDetailResolver] Product '${productId}' successfully loaded and is complete.`);
          return true;
        }),
        catchError((error) => {
          logger?.error(`[ProductDetailResolver] Failed to load product ${productId} after dispatch or timeout.`, error);
          return of(false);
        })
      );
    }),
    catchError((initialError) => {
      logger?.error(`[ProductDetailResolver] Unexpected error during initial product check for ${productId}.`, initialError);
      return of(false);
    })
  );
};