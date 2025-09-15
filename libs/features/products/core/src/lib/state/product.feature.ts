/**
 * @file product.feature.ts
 * @version 23.0.0 (Definitive Isolated Loading States - Production Ready)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-07
 * @Description
 *   FIXED: Isolated loading states per operation type. The general `isLoading` state
 *   is now only affected by primary product list operations (loadProducts, search, etc.)
 *   and NOT by secondary operations like loadProductsByIds. This prevents cart operations
 *   from interfering with the product list UI.
 */
import { createFeature, createSelector, createReducer, on, MemoizedSelector } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { AvailableFiltersResponse, ProductListViewModel, FeatureError, ProductSortField } from './product.types';
import { createSafeEntitySelectors } from '@royal-code/shared/utils';
import { Product, ProductFilters, ProductStatus } from '@royal-code/features/products/domain';
import { ProductActions } from './product.actions';

export const PRODUCTS_FEATURE_KEY = 'products';

export const productAdapter: EntityAdapter<Product> = createEntityAdapter<Product>({
  selectId: (product: Product) => product.id,
  sortComparer: false,
});

export interface ProductState extends EntityState<Product> {
  readonly featuredProductIds: string[];
  readonly currentProductListIds: string[];
  readonly recommendedProductIds: string[];
  readonly searchResultIds: string[];
  readonly searchQuery: string | null;
  readonly isSearching: boolean;
  readonly searchTotalCount: number;
  readonly searchHasMore: boolean;
  readonly availableFilters: AvailableFiltersResponse | null;
  readonly isLoadingFilters: boolean;
  
  // FIXED: Separated loading states for different operation types
  readonly isLoading: boolean;              // Only for primary list operations
  readonly isLoadingByIds: boolean;         // For loadProductsByIds operations  
  readonly isLoadingDetail: boolean;        // For individual product detail loading
  readonly isSubmitting: boolean;           // For create/update/delete operations
  
  readonly selectedProductId: string | null;
  readonly selectedVariantCombinationIdByProduct: Record<string, string | null>;
  readonly filters: ProductFilters;
  readonly currentPage: number;
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly lastFetched: number | null;
  readonly cacheTimeout: number;
  readonly error: FeatureError | null;
}

const DEFAULT_FILTERS: Readonly<ProductFilters> = {
  sortBy: 'name' as ProductSortField, 
  sortDirection: 'asc', 
  page: 1, 
  pageSize: 20,
};

export const initialProductState: ProductState = productAdapter.getInitialState({
  featuredProductIds: [],
  currentProductListIds: [],
  recommendedProductIds: [],
  searchResultIds: [],
  searchQuery: null,
  isSearching: false,
  searchTotalCount: 0,
  searchHasMore: false,
  availableFilters: null,
  isLoadingFilters: false,
  isLoading: false,
  isLoadingByIds: false,
  isLoadingDetail: false,
  isSubmitting: false,
  selectedProductId: null,
  selectedVariantCombinationIdByProduct: {},
  filters: { ...DEFAULT_FILTERS },
  currentPage: 1,
  totalCount: 0,
  hasMore: false,
  lastFetched: null,
  cacheTimeout: 300000,
  error: null,
});

export const productFeature = createFeature({
  name: PRODUCTS_FEATURE_KEY,
  reducer: createReducer(
    initialProductState,
    
    // Page lifecycle
    on(ProductActions.pageOpened, (state, { initialFilters }) => ({
      ...state,
      filters: { ...DEFAULT_FILTERS, ...initialFilters },
      currentPage: 1,
      totalCount: 0,
      hasMore: false,
      isLoading: true,
      error: null,
      lastFetched: null,
      currentProductListIds: [],
    })),

    on(ProductActions.pageClosed, (state) => ({
        ...state,
        filters: { ...DEFAULT_FILTERS },
        currentPage: 1,
        totalCount: 0,
        hasMore: false,
        isLoading: false,
        error: null,
        lastFetched: null,
        currentProductListIds: [],
    })),

    on(ProductActions.filtersUpdated, (state, { filters }) => {
      console.log('%c[ProductReducer] filtersUpdated: Current filters:', 'color: yellow;', JSON.stringify(state.filters, null, 2));
      console.log('%c[ProductReducer] filtersUpdated: New filters:', 'color: yellow;', JSON.stringify(filters, null, 2));
      const newFilters = { ...state.filters, ...filters, page: 1 };
      console.log('%c[ProductReducer] filtersUpdated: Merged filters:', 'color: yellow;', JSON.stringify(newFilters, null, 2));
      return { 
        ...state, 
        filters: newFilters, 
        currentPage: 1, 
        error: null, 
        isLoading: true, 
        currentProductListIds: [] 
      };
    }),

    on(ProductActions.nextPageLoaded, (state) => 
      !state.hasMore || state.isLoading ? state : { 
        ...state, 
        isLoading: true, 
        error: null, 
        currentPage: state.currentPage + 1 
      }
    ),

    on(ProductActions.dataRefreshed, (state) => ({ 
      ...state, 
      error: null, 
      isLoading: true, 
      currentPage: 1, 
      filters: { ...state.filters, page: 1 }, 
      currentProductListIds: [] 
    })),

    // FIXED: Primary list operations affect main isLoading
    on(ProductActions.loadProducts, ProductActions.loadFeaturedProducts, ProductActions.loadRecommendations, 
       (state) => ({ ...state, isLoading: true, error: null })),

    // FIXED: loadProductsByIds uses separate loading state
    on(ProductActions.loadProductsByIds, (state) => ({ 
      ...state, 
      isLoadingByIds: true, 
      error: null 
    })),

    // FIXED: Product detail loading uses separate state
    on(ProductActions.productSelected, (state, { id }) => ({ 
      ...state, 
      selectedProductId: id, 
      isLoadingDetail: !!id, 
      error: null 
    })),

    // Success handlers with isolated loading resets
    on(ProductActions.loadProductsSuccess, (state, { products, totalCount, hasMore }) => {
        const newProductIds = products.map(p => p.id);
        const updatedProductListIds = state.currentPage === 1 ? newProductIds : [...state.currentProductListIds, ...newProductIds];
        return productAdapter.upsertMany(products, {
            ...state,
            currentProductListIds: updatedProductListIds,
            isLoading: false,  // Reset primary loading
            totalCount,
            hasMore,
            lastFetched: Date.now(),
            error: null
        });
    }),

    on(ProductActions.loadFeaturedProductsSuccess, (state, { products }) =>
      productAdapter.upsertMany(products, {
        ...state,
        featuredProductIds: products.map(p => p.id),
        isLoading: false,  // Reset primary loading
        lastFetched: Date.now(),
        error: null
      })
    ),

    // FIXED: loadProductsByIds success only resets its own loading state
    on(ProductActions.loadProductsByIdsSuccess, (state, { products }) => 
      productAdapter.upsertMany(products, { 
        ...state, 
        isLoadingByIds: false,  // Only reset byIds loading
        error: null 
      })
    ),

    on(ProductActions.loadRecommendationsSuccess, (state, { products }) => 
      productAdapter.upsertMany(products, { 
        ...state, 
        isLoading: false,  // Reset primary loading
        recommendedProductIds: products.map(p => p.id), 
        error: null 
      })
    ),

    on(ProductActions.loadProductDetailSuccess, (state, { product }) =>
      productAdapter.upsertOne(product, { 
        ...state, 
        isLoadingDetail: false,  // Reset detail loading
        error: null 
      })
    ),

    // Error handlers
    on(ProductActions.loadProductDetailFailure, (state, { error }) => ({ 
      ...state, 
      isLoadingDetail: false, 
      error 
    })),

    on(ProductActions.loadProductsFailure, ProductActions.loadFeaturedProductsFailure, ProductActions.loadRecommendationsFailure, 
       (state, { error }) => ({ ...state, isLoading: false, error })),

    on(ProductActions.loadProductsByIdsFailure, (state, { error }) => ({ 
      ...state, 
      isLoadingByIds: false, 
      error 
    })),

    // Filter operations
    on(ProductActions.loadAvailableFilters, (state) => ({ 
      ...state, 
      isLoadingFilters: true, 
      error: null 
    })),

    on(ProductActions.loadAvailableFiltersSuccess, (state, { filters }) => ({ 
      ...state, 
      isLoadingFilters: false, 
      availableFilters: filters, 
      error: null 
    })),

    on(ProductActions.loadAvailableFiltersFailure, (state, { error }) => ({ 
      ...state, 
      isLoadingFilters: false, 
      availableFilters: null, 
      error 
    })),

    // CRUD operations
    on(ProductActions.createProductSubmitted, (state, { payload, tempId }) => 
      productAdapter.addOne({ ...payload, id: tempId, status: ProductStatus.DRAFT } as unknown as Product, { 
        ...state, 
        isSubmitting: true, 
        error: null 
      })
    ),

    on(ProductActions.createProductSuccess, (state, { product, tempId }) => {
      const stateWithoutTemp = productAdapter.removeOne(tempId, state);
      return productAdapter.addOne(product, { 
        ...stateWithoutTemp, 
        isSubmitting: false, 
        error: null, 
        totalCount: state.totalCount + 1 
      });
    }),

    on(ProductActions.createProductFailure, (state, { error, tempId }) => 
      productAdapter.removeOne(tempId, { ...state, isSubmitting: false, error })
    ),

    on(ProductActions.updateProductSubmitted, (state) => ({ 
      ...state, 
      isSubmitting: true, 
      error: null 
    })),

    on(ProductActions.updateProductSuccess, (state, { productUpdate }) => 
      productAdapter.upsertOne(productUpdate.changes as Product, { 
        ...state, 
        isSubmitting: false, 
        error: null 
      })
    ),

    on(ProductActions.updateProductFailure, (state, { error }) => ({ 
      ...state, 
      isSubmitting: false, 
      error 
    })),

    on(ProductActions.deleteProductSuccess, (state, { id }) => 
      productAdapter.removeOne(id, { 
        ...state, 
        isSubmitting: false, 
        error: null, 
        totalCount: Math.max(0, state.totalCount - 1) 
      })
    ),

    on(ProductActions.bulkDeleteProductsSuccess, (state, { ids }) => 
      productAdapter.removeMany(ids as string[], { 
        ...state, 
        isSubmitting: false, 
        error: null, 
        totalCount: Math.max(0, state.totalCount - ids.length) 
      })
    ),

    // Variant selection
    on(ProductActions.variantCombinationSelected, (state, { productId, selectedVariantCombinationId }) => ({ 
      ...state, 
      selectedVariantCombinationIdByProduct: { 
        ...state.selectedVariantCombinationIdByProduct, 
        [productId]: selectedVariantCombinationId 
      } 
    })),

    on(ProductActions.variantSelectionCleared, (state, { productId }) => {
      const updatedSelection = { ...state.selectedVariantCombinationIdByProduct };
      delete updatedSelection[productId];
      return { ...state, selectedVariantCombinationIdByProduct: updatedSelection };
    }),

    // Search operations
    on(ProductActions.searchSubmitted, (state, { query }) => ({ 
      ...state, 
      searchQuery: query, 
      isSearching: true, 
      error: null 
    })),

    on(ProductActions.searchSuccess, (state, { products, totalCount, hasMore }) =>
      productAdapter.upsertMany(products, {
        ...state,
        isSearching: false,
        searchResultIds: products.map(p => p.id),
        searchTotalCount: totalCount,
        searchHasMore: hasMore,
        error: null,
      })
    ),

    on(ProductActions.searchFailure, (state, { error }) => ({ 
      ...state, 
      isSearching: false, 
      error 
    })),

    on(ProductActions.searchStateCleared, (state) => ({ 
      ...state, 
      searchQuery: null, 
      searchResultIds: [], 
      isSearching: false, 
      searchTotalCount: 0, 
      searchHasMore: false 
    })),

    on(ProductActions.errorCleared, (state) => ({ ...state, error: null }))
  ),
  
  extraSelectors: ({ selectProductsState, selectIsLoading, selectIsLoadingByIds, selectIsLoadingDetail, selectIsSubmitting, selectError, selectFilters, selectTotalCount, selectHasMore, selectSelectedProductId, selectLastFetched, selectCacheTimeout, selectCurrentPage, selectSelectedVariantCombinationIdByProduct, selectRecommendedProductIds, selectAvailableFilters, selectIsLoadingFilters, selectSearchQuery, selectIsSearching, selectSearchResultIds, selectFeaturedProductIds, selectCurrentProductListIds }) => {

    const { selectAll, selectEntities } = createSafeEntitySelectors(productAdapter, selectProductsState as MemoizedSelector<object, ProductState | undefined>);

    const selectProductEntities = selectEntities;

    const selectProductsForCurrentList = createSelector(
        selectProductEntities,
        selectCurrentProductListIds,
        (entities, ids) => ids.map(id => entities[id]).filter((p): p is Product => !!p)
    );

    const selectSelectedProduct = createSelector(
      selectProductEntities,
      selectSelectedProductId,
      (entities, selectedId) => {
        const product = selectedId ? entities[selectedId] : undefined;
        return product?.id === selectedId ? product : undefined;
      }
    );

    const selectSearchResults = createSelector(selectProductEntities, selectSearchResultIds, (entities, ids) => ids.map(id => entities[id]).filter((p): p is Product => !!p));
    const selectSearchViewModel = createSelector(selectSearchQuery, selectIsSearching, selectSearchResults, (query, isLoading, results) => ({ query, isLoading, results }));
    const selectHasProducts = createSelector(selectProductsForCurrentList, (products) => products.length > 0);
    const selectProductById = (id: string) => createSelector(selectEntities, (entities) => (entities ? entities[id] : undefined));
    const selectSelectedVariantCombinationId = (productId: string) => createSelector(selectSelectedVariantCombinationIdByProduct, (map) => map[productId] ?? null);
    const selectFeaturedProducts = createSelector(selectProductEntities, selectFeaturedProductIds, (entities, ids) => ids.map(id => entities[id]).filter((p): p is Product => !!p));
    const selectRecommendations = createSelector(selectProductEntities, selectRecommendedProductIds, (entities, ids) => ids.map(id => entities[id]).filter((p): p is Product => !!p));
    const selectIsStale = createSelector(selectLastFetched, selectCacheTimeout, (lastFetched, timeout) => !lastFetched || Date.now() - lastFetched > timeout);
    const selectIsEmpty = createSelector(selectProductsForCurrentList, selectIsLoading, (products, isLoading) => products.length === 0 && !isLoading);
    
    // FIXED: Only primary loading states affect isBusy for UI
    const selectIsBusy = createSelector(
      selectIsLoading, 
      selectIsSubmitting, 
      selectIsLoadingFilters, 
      selectIsSearching,
      (loading, submitting, loadingFilters, searching) => 
        loading || submitting || loadingFilters || searching
    );

    const selectProductListViewModel = createSelector(
      selectProductsForCurrentList, selectSelectedProduct, selectIsLoading, selectIsSubmitting,
      selectError, selectFilters, selectTotalCount, selectHasMore, selectCurrentPage,
      selectLastFetched, selectIsStale, selectHasProducts, selectIsEmpty, selectIsBusy,
      selectSelectedVariantCombinationIdByProduct, selectAvailableFilters, selectIsLoadingFilters,
      (products, selectedProduct, isLoading, isSubmitting, error, filters, totalCount, hasMore, currentPage, lastFetched, isStale, hasProducts, isEmpty, isBusy, selectedVariantCombinationIdByProduct, availableFilters, isLoadingFilters): ProductListViewModel => {
        const pageSize = filters.pageSize ?? 20;
        return {
          products, selectedProduct, isLoading, isSubmitting, error, filters,
          totalCount, hasMore, currentPage, pageSize,
          loadedCount: products.length,
          showingFrom: totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0,
          showingTo: Math.min(currentPage * pageSize, totalCount),
          lastFetched, isStale, hasProducts, isEmpty, isBusy,
          selectedVariantCombinationIdByProduct,
          availableFilters,
          isLoadingFilters,
        };
      }
    );

    return {
      selectAllProducts: selectProductsForCurrentList,
      selectProductEntities,
      selectSelectedProduct,
      selectFeaturedProducts,
      selectRecommendations,
      selectProductById,
      selectSelectedVariantCombinationId,
      selectIsStale,
      selectHasProducts,
      selectIsEmpty,
      selectIsBusy,
      selectProductListViewModel,
      selectAvailableFilters,
      selectIsLoadingFilters,
      selectSearchResults,
      selectSearchViewModel,
      selectCurrentProductListIds,
      selectProductsForCurrentList,
      selectIsLoadingByIds,
      selectIsLoadingDetail,
    };
  },
});

export const {
  name, reducer, selectProductsState, selectIsLoading, selectIsLoadingByIds, 
  selectIsLoadingDetail, selectIsSubmitting, selectError, selectFilters, 
  selectTotalCount, selectHasMore, selectAllProducts, selectProductEntities, 
  selectSelectedProduct, selectFeaturedProducts, selectRecommendations, 
  selectProductById, selectSelectedVariantCombinationId, selectIsStale, 
  selectHasProducts, selectIsEmpty, selectIsBusy, selectProductListViewModel,
  selectAvailableFilters, selectIsLoadingFilters, selectSearchResults,
  selectSearchViewModel, selectIsSearching, selectSearchQuery,
  selectCurrentProductListIds, selectProductsForCurrentList,
} = productFeature;