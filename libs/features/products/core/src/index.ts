/**
 * @file index.ts (products-core)
 * @version 12.1.0 (Definitive & Corrected Public API)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-27
 * @description
 *   The definitive public API for the Products Core library. This barrel file
 *   exports all necessary elements for feature interaction, now including the
 *   full, correct set of selectors.
 */

// === STATE MANAGEMENT API ===
export * from './lib/state/product.facade';
export * from './lib/state/product.actions';
export * from './lib/state/product.providers';
export * from './lib/state/product.types'

// === SELECTORS API (for cross-feature state access and UI) ===
export {
  selectAllProducts,
  selectProductEntities,
  selectSelectedProduct,
  selectFeaturedProducts,
  selectProductById,
  selectProductListViewModel,
  selectIsLoading,
  selectIsSubmitting,
  selectError,
  selectHasProducts,
  selectIsBusy,
  selectIsStale,
} from './lib/state/product.feature';

// === DATA ACCESS & DOMAIN API ===
export * from './lib/data-access/abstract-product-api.service';
export * from './lib/mappers/product-mapping.service';
export * from './lib/DTO/backend.types';

// === UTILITIES API ===
export * from './lib/utils/product-type-guards';
export * from './lib/mappers/enum.mappers'; 

// === INITIALIZER API ==
// Removed product-state.initializer - moved to @royal-code/shared/initializers to break circular dependency
export * from './lib/utils/product-stock.utils';

// === BACKEND TYPES ===
export * from './lib/DTO/backend.types';

// === MOCK DATA ===
export * from './lib/data/mock-products.data';


// === SERVICES ===
export * from './lib/services/category-tree.service';