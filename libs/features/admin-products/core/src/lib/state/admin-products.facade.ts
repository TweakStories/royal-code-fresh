/**
 * @file admin-products.facade.ts
 * @Version 7.1.0 (Definitive Type Safety Fixes)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description Definitive facade with corrected type safety for the ViewModel,
 *              resolving `undefined` and `readonly` assignment issues.
 */
import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { adminProductsFeature } from './admin-products.feature';
import { AdminProductActions } from './admin-products.actions';
import { CreateProductPayload, ProductFilters, UpdateProductPayload } from '@royal-code/features/products/domain';
import { AdminProductListViewModel } from './admin-products.types';

@Injectable({ providedIn: 'root' })
export class AdminProductsFacade {
  private readonly store = inject(Store);

  // << DE FIX: De cast `as AdminProductListViewModel` is niet langer nodig, omdat de types nu matchen. >>
  readonly viewModel: Signal<AdminProductListViewModel> = toSignal(
      this.store.select(adminProductsFeature.selectViewModel),
      { initialValue: this.createInitialViewModel() }
  );

  initPage(): void { this.store.dispatch(AdminProductActions.adminPageInitialized()); }
  ensureFormLookupsLoaded(): void { this.store.dispatch(AdminProductActions.ensureFormLookupsLoaded()); }
  changeFilters(filters: Partial<ProductFilters>): void { this.store.dispatch(AdminProductActions.filtersChanged({ filters })); }
  openProductDetailPage(productId: string): void { this.store.dispatch(AdminProductActions.productDetailPageOpened({ productId })); }
  selectProduct(productId: string | null): void { this.store.dispatch(AdminProductActions.selectProduct({ productId })); }
  createProduct(payload: CreateProductPayload): void { const tempId = `temp_${Date.now()}`; this.store.dispatch(AdminProductActions.createProductSubmitted({ payload, tempId })); }
  updateProduct(productId: string, payload: UpdateProductPayload): void { this.store.dispatch(AdminProductActions.updateProductSubmitted({ productId, payload })); }
  deleteProduct(productId: string): void { this.store.dispatch(AdminProductActions.deleteProductConfirmed({ productId })); }

  private createInitialViewModel(): AdminProductListViewModel {
    return {
      products: [],
      totalCount: 0,
      isLoading: true,
      isSubmitting: false,
      error: null,
      filters: {},
      predefinedAttributes: null,
      isLoadingAttributes: true,
      attributeNames: [],
      customAttributeDefinitions: [],
      isLoadingCustomAttributeDefinitions: true,
      displaySpecificationDefinitions: [],
      isLoadingDisplaySpecificationDefinitions: true,
      selectedProduct: undefined,
      allCategories: [],
      isLoadingCategories: true,
      categoryDisplayMap: new Map()
    };
  }
}