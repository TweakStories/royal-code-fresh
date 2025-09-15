/**
 * @file admin-products.effects.ts
 * @Version 4.0.0 (Architecturally Correct)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description Architecturally correct effects. All presentation logic has been removed.
 *              Effects are now solely responsible for API interactions and dispatching
 *              subsequent actions with raw data for the reducer to handle.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  tap,
  exhaustMap,
  withLatestFrom,
  filter,
  debounceTime,
  distinctUntilChanged,
  startWith
} from 'rxjs/operators';
import { AdminProductActions } from './admin-products.actions';
import { AdminProductApiService } from '@royal-code/features/admin-products/data-access';
import { ProductMappingService } from '@royal-code/features/products/core';
import { Router } from '@angular/router';
import { NotificationService } from '@royal-code/ui/notifications';
import { Update } from '@ngrx/entity';
import { isPhysicalProduct, Product } from '@royal-code/features/products/domain';
import { HttpErrorResponse } from '@angular/common/http';
import { Media } from '@royal-code/shared/domain';
import { Store } from '@ngrx/store';
import { MediaActions } from '@royal-code/features/media/core';
import { adminProductsFeature } from './admin-products.feature';
import { LoggerService } from '@royal-code/core/core-logging';

@Injectable()
export class AdminProductsEffects {
  private readonly actions$ = inject(Actions);
  private readonly apiService = inject(AdminProductApiService);
  private readonly mappingService = inject(ProductMappingService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly store = inject(Store);
  private readonly logPrefix = '[AdminProductsEffects]';

  initPageOrEnsureLookups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.adminPageInitialized, AdminProductActions.ensureFormLookupsLoaded),
      withLatestFrom(
        this.store.select(adminProductsFeature.selectPredefinedAttributes),
        this.store.select(adminProductsFeature.selectAllCategories),
        this.store.select(adminProductsFeature.selectIsDataStale)
      ),
      filter(([, attributes, categories, isStale]) => {
        const needsAttributes = attributes === null;
        const needsCategories = categories === undefined || categories === null || categories.length === 0;
        const shouldRefresh = isStale && (needsAttributes || needsCategories);
        return needsAttributes || needsCategories || shouldRefresh;
      }),
      tap(() => this.logger.debug(`${this.logPrefix} Loading missing or stale lookup data`)),
      switchMap(() => [
        AdminProductActions.loadLookups(),
        AdminProductActions.loadCategories()
      ])
    )
  );

  loadLookups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.loadLookups),
      tap(() => this.logger.debug(`${this.logPrefix} Loading all lookups in batch`)),
      switchMap(() =>
        this.apiService.getLookups().pipe(
          tap(lookups => this.logger.debug(`${this.logPrefix} Received lookups:`, {
            attributeCount: Object.keys(lookups.variantAttributes || {}).length,
            customAttrCount: lookups.customAttributes?.length || 0,
            displaySpecCount: lookups.displaySpecifications?.length || 0
          })),
          map(lookups => AdminProductActions.loadLookupsSuccess({ lookups })),
          catchError(error => {
            this.logger.error(`${this.logPrefix} Failed to load lookups:`, error);
            return of(AdminProductActions.loadLookupsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  unpackLookups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.loadLookupsSuccess),
      tap(() => this.logger.debug(`${this.logPrefix} Unpacking lookups`)),
      switchMap(({ lookups }) => [
        AdminProductActions.loadPredefinedAttributesSuccess({ attributes: lookups.variantAttributes }),
        AdminProductActions.loadCustomAttributeDefinitionsSuccess({ definitions: lookups.customAttributes }),
        AdminProductActions.loadDisplaySpecificationDefinitionsSuccess({ definitions: lookups.displaySpecifications })
      ])
    )
  );

  // << DE FIX: Verwijdering van alle presentatie-logica. De effect haalt alleen de data op. >>
  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.loadCategories),
      tap(() => this.logger.debug(`${this.logPrefix} Loading categories`)),
      switchMap(() =>
        this.apiService.getCategories().pipe(
          tap(categories => this.logger.debug(`${this.logPrefix} Received ${categories.length} categories`)),
          map(categories => AdminProductActions.loadCategoriesSuccess({ categories })),
          catchError(error => {
            this.logger.error(`${this.logPrefix} Failed to load categories:`, error);
            return of(AdminProductActions.loadCategoriesFailure({ error: error.message }));
          })
        )
      )
    )
  );

  triggerLoadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.adminPageInitialized, AdminProductActions.filtersChanged),
      startWith(null),
      debounceTime(300),
      distinctUntilChanged((prev, curr) => {
        if (!prev || !curr) return false;
        if (prev.type !== curr.type) return false;
        const prevFilters = prev.type === AdminProductActions.filtersChanged.type ? prev.filters : {};
        const currFilters = curr.type === AdminProductActions.filtersChanged.type ? curr.filters : {};
        return JSON.stringify(prevFilters) === JSON.stringify(currFilters);
      }),
      map(action => {
        const filters = action?.type === AdminProductActions.filtersChanged.type ? action.filters : {};
        this.logger.debug(`${this.logPrefix} Triggering product load with filters:`, filters);
        return AdminProductActions.loadProducts({ filters });
      })
    )
  );

  loadProducts$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AdminProductActions.loadProducts),
    switchMap(({ filters }) => {
      const finalFilters = { page: 1, pageSize: 20, ...filters };
      return this.apiService.getProducts(finalFilters).pipe(
        map(response => {
          const mappedProducts = response.items.map(dto => this.mappingService.mapListItemToProduct(dto));
          return AdminProductActions.loadProductsSuccess({ products: mappedProducts, totalCount: response.totalCount });
        }),
        catchError(error => of(AdminProductActions.loadProductsFailure({ error: error.message })))
      );
    })
  )
);

  triggerLoadDetail$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AdminProductActions.productDetailPageOpened),
    map(({ productId }) => AdminProductActions.loadProductDetail({ productId }))
  )
);

loadDetail$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AdminProductActions.loadProductDetail),
    switchMap(({ productId }) =>
      this.apiService.getProductById(productId).pipe(
        map(dto => {
          const productDetail = this.mappingService.mapProductDetail(dto);
          return AdminProductActions.loadProductDetailSuccess({ product: productDetail });
        }),
        catchError(err => of(AdminProductActions.loadProductDetailFailure({ error: err.message, productId: productId })))
      )
    )
  )
);

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.createProductSubmitted),
      tap(({ payload }) => this.logger.info(`${this.logPrefix} Creating product:`, payload.name)),
      exhaustMap(({ payload }) =>
        this.apiService.createProduct(payload).pipe(
          map(responseDto => {
            const newProduct = this.mappingService.mapProductDetail(responseDto);
            this.logger.info(`${this.logPrefix} Product created successfully:`, newProduct.id);
            return AdminProductActions.createProductSuccess({ product: newProduct });
          }),
          catchError(error => {
            this.logger.error(`${this.logPrefix} Failed to create product:`, error);
            return of(AdminProductActions.createProductFailure({ error: error.message }));
          })
        )
      )
    )
  );

  createProductSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.createProductSuccess),
      tap(({ product }) => {
        if (product && product.id) {
          this.notificationService.showSuccess('Product succesvol aangemaakt!');
          this.router.navigate(['/products', product.id]);
        } else {
          this.logger.error(`${this.logPrefix} Product creation succeeded but no ID returned`);
          this.notificationService.showError('Product aangemaakt, maar kon niet navigeren');
          this.router.navigate(['/products']);
        }
      })
    ), { dispatch: false }
  );

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.updateProductSubmitted),
      tap(({ productId, payload }) => this.logger.info(`${this.logPrefix} Updating product: ${productId}`)),
      exhaustMap(({ productId, payload }) =>
        this.apiService.updateProduct(productId, payload).pipe(
          map(responseDto => {
            const updatedProduct = this.mappingService.mapProductDetail(responseDto);
            const allProductMedia: Media[] = [];
            if (updatedProduct.media) { allProductMedia.push(...updatedProduct.media); }
            updatedProduct.variantAttributes?.forEach(attr => { attr.values.forEach(val => { if (val.media) { allProductMedia.push(...val.media); } }); });
            if (allProductMedia.length > 0) { this.store.dispatch(MediaActions.mediaLoadedFromSource({ media: allProductMedia })); }
            const productUpdate: Update<Product> = { id: productId, changes: updatedProduct };
            this.logger.info(`${this.logPrefix} Product updated successfully: ${productId}`);
            return AdminProductActions.updateProductSuccess({ productUpdate });
          }),
          catchError(error => {
            this.logger.error(`${this.logPrefix} Failed to update product ${productId}:`, error);
            if (error instanceof HttpErrorResponse && error.status === 409) {
              const errorMessage = 'SKU bestaat al – pas aan of verwijder duplicaat.';
              this.notificationService.showError(errorMessage);
              return of(AdminProductActions.updateProductFailure({ error: errorMessage }));
            }
            return of(AdminProductActions.updateProductFailure({ error: error.message || 'Onbekende updatefout' }));
          })
        )
      )
    )
  );

  updateProductSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.updateProductSuccess),
      tap(() => this.notificationService.showSuccess('Product succesvol bijgewerkt!'))
    ), { dispatch: false }
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.deleteProductConfirmed),
      tap(({ productId }) => this.logger.info(`${this.logPrefix} Deleting product: ${productId}`)),
      exhaustMap(({ productId }) =>
        this.apiService.deleteProduct(productId).pipe(
          map(() => {
            this.logger.info(`${this.logPrefix} Product deleted successfully: ${productId}`);
            return AdminProductActions.deleteProductSuccess({ productId });
          }),
          catchError(error => {
            this.logger.error(`${this.logPrefix} Failed to delete product ${productId}:`, error);
            return of(AdminProductActions.deleteProductFailure({ error: error.message }));
          })
        )
      )
    )
  );

  deleteProductSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.deleteProductSuccess),
      tap(() => this.notificationService.showSuccess('Product succesvol verwijderd!'))
    ), { dispatch: false }
  );

  updateStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.updateStockSubmitted),
      tap(({ productId, newStock }) => this.logger.info(`${this.logPrefix} Updating stock for ${productId}: ${newStock}`)),
      exhaustMap(({ productId, newStock }) =>
        this.apiService.updatePhysicalStock(
          productId, undefined, newStock, 'Admin Panel Update', 'placeholder-user-id'
        ).pipe(
          map(responseDto => {
            const updatedProduct = this.mappingService.mapProductDetail(responseDto);
            const changes: Partial<Product> = {};
            if (isPhysicalProduct(updatedProduct)) {
              changes.stockQuantity = updatedProduct.stockQuantity;
              changes.stockStatus = updatedProduct.stockStatus;
            }
            const productUpdate: Update<Product> = { id: productId, changes };
            this.logger.info(`${this.logPrefix} Stock updated successfully for: ${productId}`);
            return AdminProductActions.updateStockSuccess({ productUpdate });
          }),
          catchError(error => {
            this.logger.error(`${this.logPrefix} Failed to update stock for ${productId}:`, error);
            return of(AdminProductActions.updateStockFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateStockSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminProductActions.updateStockSuccess),
      tap(() => this.notificationService.showSuccess('Voorraad succesvol bijgewerkt!'))
    ), { dispatch: false }
  );

  operationFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AdminProductActions.createProductFailure, AdminProductActions.updateProductFailure,
        AdminProductActions.deleteProductFailure, AdminProductActions.updateStockFailure,
        AdminProductActions.loadLookupsFailure, AdminProductActions.loadProductsFailure,
        AdminProductActions.loadProductDetailFailure, AdminProductActions.loadCategoriesFailure
      ),
      tap(({ error }) => {
        this.logger.error(`${this.logPrefix} Operation failed:`, error);
        this.notificationService.showError(`Operatie mislukt: ${error}`);
      })
    ), { dispatch: false }
  );
}