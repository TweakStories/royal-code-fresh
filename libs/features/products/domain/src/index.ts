/**
 * @file index.ts (products-domain)
 * @Version 2.0.0 (Enterprise Blueprint Standard)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-16
 * @description
 *   Definitive public API for the Products Domain library. This barrel file
 *   exports all data models, command payloads, filter definitions, enums, and
 *   constants, establishing a single, consistent source of truth for the entire
 *   product domain across the monorepo.
 */

// === DOMAIN MODELS ===
export * from './lib/models/index';


// === VIEW MODELS (for specific, non-entity representations) ===
export * from './lib/models/product-list-item.model';

// === COMMAND PAYLOADS (for CUD operations) ===
export * from './lib/models/product-mutation.model';

// === QUERY FILTERS ===
export * from './lib/models/product-filters.model';
export * from './lib/models/search-suggestion.model';

// === ENUMS & TYPES ===
export * from './lib/types/product-types.enum';
export { ProductStatus, StockStatus } from './lib/types/product-types.enum';

// === CONSTANTS ===
export * from './lib/constants/product.constants';

// === UTILS ===
export * from './lib/utils/product-type-guards';

// === DATA ===
// Mock data moved to @royal-code/features/products/core to resolve circular dependency

// === DTOs ===
export * from './lib/DTOs/predefined-attribute.dto';
export * from './lib/DTOs/custom-attribute-definition.dto';
export * from './lib/DTOs/display-specification-definition.dto';