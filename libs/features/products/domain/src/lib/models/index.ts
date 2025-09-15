/**
 * @file index.ts (products-domain/lib)
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-12
 * @Description
 *   Internal barrel file that aggregates and re-exports all product-related
 *   domain models, enums, and type definitions from this directory. This provides
 *   a single, clean import point for the main library index.
 */

// === CORE PRODUCT MODELS ===
export * from './product-base.model';
export * from './product-category.model';
export * from './product-commerce-details.model';
export * from './product-digital.model';
export * from './product-error.model';
export * from './product-game-item.model';
export * from './product-physical.model';
export * from './product-service.model';
export * from './product-variants.model';
export * from './product.model';

// === VIEW MODELS (for specific, non-entity representations) ===
export * from './product-list-item.model';

// === COMMAND PAYLOADS (for CUD operations) ===
export * from './product-mutation.model';

// === QUERY FILTERS ===
export * from './product-filters.model';
export * from './search-suggestion.model';

// === CONSTANTS ===
export * from '../constants/product.constants';

// === SPECIALIZED MODELS ===
export * from './diy-kit.model';

// === DIY KIT TYPES ===
export type {
  DiyKitPageData,
  DiyKitProductCardData,
  DiyTechHighlightGridItem,
  DiyTestimonialItem,
  DiyFaqItem,
} from './diy-kit.model';
