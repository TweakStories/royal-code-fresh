/**
 * @file admin-products.feature.ts
 * @Version 6.0.0 (Definitive Readonly Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description Definitive feature definition. All selectors now correctly return
 *              `readonly` arrays where appropriate, ensuring full type compatibility
 *              with the ViewModel and facade.
 */
import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Product, ProductCategory, ProductFilters } from '@royal-code/features/products/domain';
import { AdminProductActions } from './admin-products.actions';
import { PredefinedAttributesMap, CustomAttributeDefinitionDto, DisplaySpecificationDefinitionDto } from '@royal-code/features/products/domain';
import { AuthActions } from '@royal-code/store/auth';
import { AdminProductListViewModel } from './admin-products.types';

// === STATE INTERFACE ===
export interface AdminProductsState extends EntityState<Product> {
  totalCount: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  filters: Partial<ProductFilters>;
  selectedProductId: string | null;
  predefinedAttributes: PredefinedAttributesMap | null;
  isLoadingAttributes: boolean;
  customAttributeDefinitions: readonly CustomAttributeDefinitionDto[];
  isLoadingCustomAttributeDefinitions: boolean;
  displaySpecificationDefinitions: readonly DisplaySpecificationDefinitionDto[];
  isLoadingDisplaySpecificationDefinitions: boolean;
  allCategories: readonly ProductCategory[];
  isLoadingCategories: boolean;
  lastUpdated: number;
}

// === ENTITY ADAPTER ===
export const adminProductAdapter: EntityAdapter<Product> = createEntityAdapter<Product>({
  sortComparer: (a: Product, b: Product) => (b.lastModified?.timestamp ?? 0) - (a.lastModified?.timestamp ?? 0)
});

// === INITIAL STATE ===
export const initialAdminProductsState: AdminProductsState = adminProductAdapter.getInitialState({
  totalCount: 0,
  isLoading: true,
  isSubmitting: false,
  error: null,
  filters: {},
  selectedProductId: null,
  predefinedAttributes: null,
  isLoadingAttributes: false,
  customAttributeDefinitions: [],
  isLoadingCustomAttributeDefinitions: false,
  displaySpecificationDefinitions: [],
  isLoadingDisplaySpecificationDefinitions: false,
  allCategories: [],
  isLoadingCategories: false,
  lastUpdated: 0,
});

// === HELPER FUNCTION (voor selectors) ===
const getDisplayNameFromKey = (key: string): string => {
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
};

// === FEATURE (REDUCER & SELECTORS) ===
export const adminProductsFeature = createFeature({
  name: 'adminProducts',
  reducer: createReducer(
    initialAdminProductsState,
    on(AuthActions.logoutCompleted, () => initialAdminProductsState),
    on(AdminProductActions.adminPageInitialized, (state) => ({ ...state, isLoading: true, error: null, lastUpdated: Date.now() })),
    on(AdminProductActions.filtersChanged, (state, { filters }) => ({ ...state, filters: { ...state.filters, ...filters, page: 1 }, isLoading: true, error: null, lastUpdated: Date.now() })),
    on(AdminProductActions.loadProducts, (state, { filters }) => ({ ...state, isLoading: true, filters: { ...state.filters, ...filters }, lastUpdated: Date.now() })),
    on(AdminProductActions.loadProductsSuccess, (state, { products, totalCount }) => {
        const selectedId = state.selectedProductId;
        const currentDetailedProduct = selectedId ? state.entities[selectedId] : undefined;
        let newState = adminProductAdapter.upsertMany(products, { ...state, totalCount, isLoading: false, lastUpdated: Date.now() });
        if (currentDetailedProduct && products.some(p => p.id === currentDetailedProduct.id) && (currentDetailedProduct.variantCombinations?.length ?? 0) > 0) {
            const listVersion = products.find(p => p.id === currentDetailedProduct.id);
            if (!listVersion?.variantCombinations?.length) { newState = adminProductAdapter.upsertOne(currentDetailedProduct, newState); }
        }
        return newState;
    }),
    on(AdminProductActions.loadProductsFailure, (state, { error }) => ({ ...state, isLoading: false, error, lastUpdated: Date.now() })),
    on(AdminProductActions.loadLookups, (state) => ({ ...state, isLoadingAttributes: true, isLoadingCustomAttributeDefinitions: true, isLoadingDisplaySpecificationDefinitions: true, error: null })),
    on(AdminProductActions.loadLookupsFailure, (state, { error }) => ({ ...state, isLoadingAttributes: false, isLoadingCustomAttributeDefinitions: false, isLoadingDisplaySpecificationDefinitions: false, error: `Failed to load form lookups: ${error}` })),
    on(AdminProductActions.loadPredefinedAttributesSuccess, (state, { attributes }) => ({ ...state, predefinedAttributes: attributes, isLoadingAttributes: false })),
    on(AdminProductActions.loadCustomAttributeDefinitionsSuccess, (state, { definitions }) => ({ ...state, customAttributeDefinitions: definitions, isLoadingCustomAttributeDefinitions: false })),
    on(AdminProductActions.loadDisplaySpecificationDefinitionsSuccess, (state, { definitions }) => ({ ...state, displaySpecificationDefinitions: definitions, isLoadingDisplaySpecificationDefinitions: false })),
    on(AdminProductActions.productDetailPageOpened, (state, { productId }) => ({ ...state, isLoading: true, error: null, selectedProductId: productId })),
    on(AdminProductActions.loadProductDetailSuccess, (state, { product }) => adminProductAdapter.upsertOne(product, { ...state, isLoading: false, selectedProductId: product.id, error: null, lastUpdated: Date.now() })),
    on(AdminProductActions.loadProductDetailFailure, (state, { error }) => ({ ...state, isLoading: false, error, lastUpdated: Date.now() })),
    on(AdminProductActions.selectProduct, (state, { productId }) => {
      const hasProduct = productId && state.entities[productId];
      const hasDetailData = hasProduct && state.entities[productId]?.variantCombinations && state.entities[productId]!.variantCombinations!.length > 0;
      return { ...state, selectedProductId: productId, isLoading: hasDetailData ? false : state.isLoading, error: hasDetailData ? null : state.error };
    }),
    on(AdminProductActions.loadCategories, (state) => ({ ...state, isLoadingCategories: true })),
    on(AdminProductActions.loadCategoriesSuccess, (state, { categories }) => ({ ...state, allCategories: categories, isLoadingCategories: false })),
    on(AdminProductActions.loadCategoriesFailure, (state, { error }) => ({ ...state, error: `Failed to load categories: ${error}`, isLoadingCategories: false })),
    on(AdminProductActions.createProductSubmitted, (state) => ({ ...state, isSubmitting: true, error: null })),
    on(AdminProductActions.createProductSuccess, (state, { product }) => {
        if (!product?.id) { return { ...state, isSubmitting: false, error: 'Received product without ID after creation.' }; }
        return adminProductAdapter.addOne(product, { ...state, isSubmitting: false, totalCount: state.totalCount + 1, selectedProductId: product.id, lastUpdated: Date.now() });
    }),
    on(AdminProductActions.createProductFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),
    on(AdminProductActions.updateProductSubmitted, (state) => ({ ...state, isSubmitting: true, error: null })),
    on(AdminProductActions.updateProductSuccess, (state, { productUpdate }) => adminProductAdapter.updateOne(productUpdate, { ...state, isSubmitting: false, lastUpdated: Date.now() })),
    on(AdminProductActions.updateProductFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),
    on(AdminProductActions.updateStockSuccess, (state, { productUpdate }) => adminProductAdapter.updateOne(productUpdate, { ...state, isSubmitting: false, lastUpdated: Date.now() })),
    on(AdminProductActions.deleteProductSuccess, (state, { productId }) => adminProductAdapter.removeOne(productId, { ...state, isSubmitting: false, totalCount: state.totalCount - 1, selectedProductId: state.selectedProductId === productId ? null : state.selectedProductId, lastUpdated: Date.now() }))
  ),
  extraSelectors: ({ selectAdminProductsState, selectPredefinedAttributes, selectSelectedProductId, selectEntities, selectAllCategories, selectLastUpdated }) => {
    const { selectAll } = adminProductAdapter.getSelectors(selectAdminProductsState);
    const selectSelectedProduct = createSelector(selectEntities, selectSelectedProductId, (entities, selectedId) => (selectedId ? entities[selectedId] : undefined));
    const selectAttributeNames = createSelector(selectPredefinedAttributes, (attributes) => (attributes ? Object.keys(attributes) : []));
    const selectIsDataStale = createSelector(selectLastUpdated, (lastUpdated) => { const fiveMinutesAgo = Date.now() - (5 * 60 * 1000); return lastUpdated < fiveMinutesAgo; });

    const selectCategoriesWithDisplayNames = createSelector(
      selectAllCategories,
      (categories): readonly ProductCategory[] => { // << DE FIX: retourneert nu readonly
        const transformCategory = (cat: ProductCategory): ProductCategory => ({
          ...cat,
          name: getDisplayNameFromKey(cat.key),
          children: cat.children ? cat.children.map(transformCategory) : [],
        });
        return categories.map(transformCategory);
      }
    );

    const selectCategoryDisplayMap = createSelector(
      selectAllCategories,
      (categories): Map<string, string> => {
        const displayMap = new Map<string, string>();
        const processCategory = (cat: ProductCategory) => {
          displayMap.set(cat.id, getDisplayNameFromKey(cat.key));
          if (cat.children) { cat.children.forEach(processCategory); }
        };
        categories.forEach(processCategory);
        return displayMap;
      }
    );

    const selectViewModel = createSelector(
        selectAll,
        selectAdminProductsState,
        selectSelectedProduct,
        selectAttributeNames,
        selectCategoriesWithDisplayNames,
        selectCategoryDisplayMap,
        (products, state, selectedProduct, attributeNames, allCategories, categoryDisplayMap): AdminProductListViewModel => ({
            products,
            selectedProduct,
            attributeNames,
            allCategories,
            categoryDisplayMap,
            isLoading: state.isLoading,
            isSubmitting: state.isSubmitting,
            error: state.error,
            filters: state.filters,
            totalCount: state.totalCount,
            predefinedAttributes: state.predefinedAttributes,
            isLoadingAttributes: state.isLoadingAttributes,
            customAttributeDefinitions: state.customAttributeDefinitions,
            isLoadingCustomAttributeDefinitions: state.isLoadingCustomAttributeDefinitions,
            displaySpecificationDefinitions: state.displaySpecificationDefinitions,
            isLoadingDisplaySpecificationDefinitions: state.isLoadingDisplaySpecificationDefinitions,
            isLoadingCategories: state.isLoadingCategories,
        })
    );

    return {
      selectAll, selectEntities, selectSelectedProduct, selectAttributeNames, selectIsDataStale,
      selectCategoryDisplayMap,
      selectViewModel,
      selectAllCategories: selectCategoriesWithDisplayNames
    };
  }
});

export const {
  name, reducer, selectAdminProductsState, selectTotalCount, selectIsLoading,
  selectIsSubmitting, selectError, selectFilters, selectPredefinedAttributes,
  selectIsLoadingAttributes, selectCustomAttributeDefinitions, selectIsLoadingCustomAttributeDefinitions,
  selectAttributeNames, selectDisplaySpecificationDefinitions, selectIsLoadingDisplaySpecificationDefinitions,
  selectSelectedProduct, selectAllCategories, selectIsLoadingCategories, selectIsDataStale,
  selectCategoryDisplayMap, selectViewModel
} = adminProductsFeature;