/**
 * @file product.types.ts
 * @Version 13.7.2 (Definitive - Corrected ProductSortField)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   Defines the strict type contracts for the Product feature's state management.
 *   `ProductSortField` is now correctly aligned with the UI implementation.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-30
 * @PromptSummary Corrected type mismatch for ProductSortField and null-check in filter sidebar.
 */
import { Product, ProductFilters, AvailableFiltersResponse } from '@royal-code/features/products/domain';
import { AppIcon } from '@royal-code/shared/domain';
import { ParagraphColor } from '@royal-code/ui/paragraph';
import { CreateProductPayload as BaseCreateProductPayload } from '@royal-code/features/products/domain';

export type { AvailableFiltersResponse };

// --- Error & Filter Types ---

/** Represents a structured error within the product feature for clear feedback and debugging. */
export interface FeatureError {
  readonly message: string;
  readonly operation?: string; 
  readonly code?: string;
  readonly context?: Record<string, unknown>; 
  readonly timestamp?: number; 
  readonly severity?: 'info' | 'warning' | 'error' | 'critical';
  readonly source?: string; 
  readonly isPersistent?: boolean; 
}


/** Defines the available sorting criteria for product collections, aligned with UI capabilities. */
export type ProductSortField = 'name' | 'price' | 'createdAt' | 'popularity';

// --- CRUD Operation Payloads ---

/** The definitive payload for creating a new product. */
export type CreateProductPayload = BaseCreateProductPayload;

/** The definitive payload for updating an existing product, allowing partial updates. */
export type UpdateProductPayload = Partial<Omit<Product, 'id' | 'type' | 'createdAt' | 'lastModified' | 'reviews'>>;


// --- ViewModels ---

/**
 * @interface ProductListViewModel
 * @description The single, complete view model for the product list/grid feature.
 *              This is the object that UI components should consume from the facade.
 */
export interface ProductListViewModel {
  // Core Data
  readonly products: readonly Product[];
  readonly selectedProduct: Product | undefined;

  // Operational State
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly error: FeatureError | null;

  // Filter & Pagination
  readonly filters: ProductFilters;
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly currentPage: number;
  readonly pageSize: number;
  readonly loadedCount: number;
  readonly showingFrom: number;
  readonly showingTo: number;

  // Cache & Metadata
  readonly lastFetched: number | null;
  readonly isStale: boolean;

  // Derived Boolean Flags
  readonly hasProducts: boolean;
  readonly isEmpty: boolean;
  readonly isBusy: boolean;

  // User Interaction State
  readonly selectedVariantCombinationIdByProduct: Record<string, string | null>;

  // Filter UI State
  readonly availableFilters: AvailableFiltersResponse | null;
  readonly isLoadingFilters: boolean;
}

/**
 * @interface StockDisplayInfo
 * @description Defines the structured data for displaying product stock status in the UI.
 */
export interface StockDisplayInfo {
  readonly text: string;
  readonly icon: AppIcon;
  readonly colorClass: ParagraphColor;
}