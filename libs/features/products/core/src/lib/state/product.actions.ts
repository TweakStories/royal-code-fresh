/**
 * @file product.actions.ts
 * @Version 14.0.0 (Search Actions Integrated)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Defines all NgRx actions for the Product domain. This version integrates
 *   actions for handling product search functionality.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AvailableFiltersResponse, Product, ProductFilters } from '@royal-code/features/products/domain';
import { CreateProductPayload, UpdateProductPayload, FeatureError } from './product.types';

export const ProductActions = createActionGroup({
  source: 'Product',
  events: {
    // === Page Lifecycle & Context Management ===
    'Page Opened': props<{ initialFilters?: Partial<ProductFilters>; forceRefresh?: boolean; }>(),
    'Page Closed': emptyProps(),
    'Filters Updated': props<{ filters: Partial<ProductFilters> }>(),
    'Next Page Loaded': emptyProps(),
    'Data Refreshed': emptyProps(),

    // === Search Operations ===
    'Search Submitted': props<{ query: string }>(),
    'Search Success': props<{ products: Product[]; totalCount: number; hasMore: boolean }>(),
    'Search Failure': props<{ error: FeatureError }>(),
    'Search State Cleared': emptyProps(),

    // === Data Loading API Operations ===
    'Load Products': emptyProps(),
    'Load Products Success': props<{ products: Product[]; totalCount: number; hasMore: boolean }>(),
    'Load Products Failure': props<{ error: FeatureError }>(),
    'Load Featured Products': emptyProps(),
    'Load Featured Products Success': props<{ products: Product[] }>(),
    'Load Featured Products Failure': props<{ error: FeatureError }>(),
    'Load Products By Ids': props<{ ids: readonly string[] }>(),
    'Load Products By Ids Success': props<{ products: Product[] }>(),
    'Load Products By Ids Failure': props<{ error: FeatureError }>(),
    'Load Product Detail Success': props<{ product: Product }>(),
    'Load Product Detail Failure': props<{ error: FeatureError; id: string }>(),
    'Load Recommendations': emptyProps(),
    'Load Recommendations Success': props<{ products: Product[] }>(),
    'Load Recommendations Failure': props<{ error: FeatureError }>(),

    // === Filter Definition Loading ===
    'Load Available Filters': emptyProps(),
    'Load Available Filters Success': props<{ filters: AvailableFiltersResponse }>(),
    'Load Available Filters Failure': props<{ error: FeatureError }>(),

    // === CRUD Operations ===
    'Create Product Submitted': props<{ payload: CreateProductPayload; tempId: string }>(),
    'Create Product Success': props<{ product: Product; tempId: string }>(),
    'Create Product Failure': props<{ error: FeatureError; tempId: string }>(),
    'Update Product Submitted': props<{ id: string; payload: UpdateProductPayload }>(),
    'Update Product Success': props<{ productUpdate: Update<Product> }>(),
    'Update Product Failure': props<{ error: FeatureError; id: string }>(),
    'Delete Product Confirmed': props<{ id: string }>(),
    'Delete Product Success': props<{ id: string }>(),
    'Delete Product Failure': props<{ error: FeatureError; id:string }>(),
    'Bulk Delete Products Confirmed': props<{ ids: readonly string[] }>(),
    'Bulk Delete Products Success': props<{ ids: readonly string[] }>(),
    'Bulk Delete Products Failure': props<{ error: FeatureError; ids: readonly string[] }>(),

    // === UI State & User Interactions ===
    'Product Selected': props<{ id: string | null }>(),
    'Variant Combination Selected': props<{ productId: string; selectedVariantCombinationId: string | null; }>(),
    'Variant Selection Cleared': props<{ productId: string }>(),
    'Error Cleared': emptyProps(),
  },
});