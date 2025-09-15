/**
 * @file product.effects.ts
 * @version 16.0.0 (Loop Fix - Minimal Effects)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Minimal and safe effects for Product domain. This version eliminates ALL
 *   potential circular dependencies by having very specific, isolated effects
 *   that don't trigger each other.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, catchError, withLatestFrom, exhaustMap, mergeMap, tap } from 'rxjs/operators';
import { NotificationService } from '@royal-code/ui/notifications';
import { ProductActions } from './product.actions';
import { selectProductsState, selectProductEntities } from './product.feature';
import { AbstractProductApiService } from '../data-access/abstract-product-api.service';
import { ProductMappingService } from '../mappers/product-mapping.service';
import { ErrorActions } from '@royal-code/store/error';
import { StructuredError } from '@royal-code/shared/domain';
import { FeatureError } from './product.types';

@Injectable()
export class ProductEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly productsApiService = inject(AbstractProductApiService);
  private readonly mappingService = inject(ProductMappingService);
  private readonly notificationService = inject(NotificationService);

  /**
   * FIXED: Only trigger on page opened (initial load)
   */
  triggerInitialLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.pageOpened),
      map(() => {
        console.log('%c[ProductEffects] Page opened - dispatching loadProducts', 'color: blue; font-weight: bold;');
        return ProductActions.loadProducts();
      })
    )
  );

  /**
   * FIXED: Only trigger on filters updated (filter changes)
   */
  triggerFilterLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.filtersUpdated),
      map(() => {
        console.log('%c[ProductEffects] Filters updated - dispatching loadProducts', 'color: blue; font-weight: bold;');
        return ProductActions.loadProducts();
      })
    )
  );

  /**
   * FIXED: Only trigger on data refreshed (manual refresh)
   */
  triggerRefreshLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.dataRefreshed),
      map(() => {
        console.log('%c[ProductEffects] Data refreshed - dispatching loadProducts', 'color: blue; font-weight: bold;');
        return ProductActions.loadProducts();
      })
    )
  );

  /**
   * ISOLATED: Load products effect that only responds to loadProducts action
   */
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      withLatestFrom(this.store.select(selectProductsState)),
      switchMap(([action, state]) => {
        console.log('%c[ProductEffects] Loading products with filters:', 'color: orange; font-weight: bold;', JSON.stringify(state.filters, null, 2));
        
        return this.productsApiService.getProducts(state.filters).pipe(
          map(dto => {
            const collection = this.mappingService.mapProductListResponse(dto);
            console.log('%c[ProductEffects] Products loaded successfully:', 'color: green;', collection.items.length, 'products');
            return ProductActions.loadProductsSuccess({ 
              products: collection.items, 
              totalCount: collection.totalCount, 
              hasMore: dto.hasNextPage 
            });
          }),
          catchError((err) => {
            console.error('%c[ProductEffects] Failed to load products:', 'color: red;', err);
            return of(ProductActions.loadProductsFailure({ 
              error: { 
                message: err.message || 'Failed to load products.', 
                operation: 'loadProducts' 
              } 
            }));
          })
        );
      })
    )
  );

  /**
   * ISOLATED: Load available filters when page opens
   */
  loadAvailableFilters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.pageOpened),
      switchMap(() =>
        this.productsApiService.getAvailableFilters().pipe(
          map(filters => {
            console.log('%c[ProductEffects] Available filters loaded:', 'color: blue;', filters);
            return ProductActions.loadAvailableFiltersSuccess({ filters });
          }),
          catchError(error => {
            console.error('%c[ProductEffects] Failed to load available filters:', 'color: red;', error);
            return of(ProductActions.loadAvailableFiltersFailure({
              error: { message: error.message || 'Failed to load available filters.', operation: 'loadAvailableFilters' }
            }));
          })
        )
      )
    )
  );

  // === ISOLATED EFFECTS (No circular dependencies) ===

  searchProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.searchSubmitted),
      switchMap(({ query }) =>
        this.productsApiService.searchProducts(query).pipe(
          map(dto => {
            const collection = this.mappingService.mapProductListResponse(dto);
            return ProductActions.searchSuccess({ 
              products: collection.items, 
              totalCount: collection.totalCount, 
              hasMore: dto.hasNextPage 
            });
          }),
          catchError((err) => of(ProductActions.searchFailure({ 
            error: { 
              message: err.message || 'Failed to execute search.', 
              operation: 'searchProducts' 
            } 
          })))
        )
      )
    )
  );

  loadFeaturedProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadFeaturedProducts),
      switchMap(() =>
        this.productsApiService.getFeaturedProducts().pipe(
          map(paginatedDto => {
            const products = paginatedDto.items.map(dto => this.mappingService.mapListItemToProduct(dto));
            return ProductActions.loadFeaturedProductsSuccess({ products });
          }),
          catchError((err) => of(ProductActions.loadFeaturedProductsFailure({
            error: { message: err.message || 'Failed to load featured products.', operation: 'loadFeaturedProducts' }
          })))
        )
      )
    )
  );

  loadRecommendations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadRecommendations),
      switchMap(() =>
        this.productsApiService.getRecommendations().pipe(
          map(dto => {
            const collection = this.mappingService.mapProductListResponse(dto);
            return ProductActions.loadRecommendationsSuccess({ products: collection.items });
          }),
          catchError((err) => of(ProductActions.loadRecommendationsFailure({ 
            error: { 
              message: err.message || 'Failed to load recommendations.', 
              operation: 'loadRecommendations' 
            } 
          })))
        )
      )
    )
  );

  loadSelectedProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.productSelected),
      switchMap(({ id }) => {
        if (!id) {
          return of(ProductActions.loadProductDetailFailure({ 
            error: { 
              message: 'No product ID provided.', 
              operation: 'getProductById' 
            }, 
            id: '' 
          }));
        }
        
        return this.productsApiService.getProductById(id).pipe(
          tap(dto => console.log('%c[ProductEffects] Raw product detail DTO:', 'color: #FF5722; font-weight: bold;', structuredClone(dto))),
          map(dto => {
            const productDetail = this.mappingService.mapProductDetail(dto);
            return ProductActions.loadProductDetailSuccess({ product: productDetail });
          }),
          catchError((err) => of(ProductActions.loadProductDetailFailure({ 
            error: { 
              message: err.message || `Failed to load details for product ${id}.`, 
              operation: 'getProductById' 
            }, 
            id: id 
          })))
        );
      })
    )
  );

  loadProductsByIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProductsByIds),
      withLatestFrom(this.store.select(selectProductEntities)),
      switchMap(([{ ids }, entities]) => {
        const missingIds = ids.filter(id => !entities[id]);
        
        if (missingIds.length === 0) {
          return of(); // No missing products, no action needed
        }

        return this.productsApiService.getProductsByIds(missingIds).pipe(
          map(dtos => ProductActions.loadProductsByIdsSuccess({
            products: dtos.map(dto => this.mappingService.mapListItemToProduct(dto)),
          })),
          catchError((err) => {
            const structuredError: StructuredError = {
              message: 'Een of meer van de benodigde productonderdelen konden niet worden geladen.',
              code: 'PRODUCT_BY_ID_404',
              operation: 'loadProductsByIds',
              context: { originalError: err.message, status: err.status, missingIds: missingIds },
              timestamp: Date.now(),
              severity: 'warning',
              source: '[ProductEffects]',
            };
            
            return of(
              ErrorActions.reportError({ error: structuredError }),
              ProductActions.loadProductsByIdsFailure({ error: structuredError })
            );
          })
        );
      })
    )
  );

  loadNextPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.nextPageLoaded),
      withLatestFrom(this.store.select(selectProductsState)),
      exhaustMap(([, state]) => {
        if (!state.hasMore || state.isLoading) {
          return of(); // No more pages or already loading
        }

        const nextPageFilters = { 
          ...state.filters, 
          page: state.currentPage + 1 
        };

        return this.productsApiService.getProducts(nextPageFilters).pipe(
          map(dto => {
            const collection = this.mappingService.mapProductListResponse(dto);
            return ProductActions.loadProductsSuccess({ 
              products: collection.items, 
              totalCount: collection.totalCount, 
              hasMore: dto.hasNextPage 
            });
          }),
          catchError((err) => of(ProductActions.loadProductsFailure({ 
            error: { 
              message: err.message || 'Failed to load next page.', 
              operation: 'loadNextPage' 
            } 
          })))
        );
      })
    )
  );
}