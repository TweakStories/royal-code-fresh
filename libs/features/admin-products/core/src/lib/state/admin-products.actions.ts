/**
 * @file admin-products.actions.ts
 * @Version 2.1.0 (Corrected Action Payloads)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description Corrected actions for the Admin Products feature state. The `loadCategoriesSuccess`
 *              action now only carries the essential category data, leaving display logic to selectors.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { CreateProductPayload, Product, ProductCategory, ProductFilters, UpdateProductPayload } from '@royal-code/features/products/domain';
import { PredefinedAttributesMap, CustomAttributeDefinitionDto, DisplaySpecificationDefinitionDto } from '@royal-code/features/products/domain';
import { ProductLookups } from '@royal-code/features/admin-products/domain';

export const AdminProductActions = createActionGroup({
  source: 'Admin Products',
    events: {
    // === PAGE LIFECYCLE & FILTERS ===
    'Admin Page Initialized': emptyProps(),
    'Ensure Form Lookups Loaded': emptyProps(),
    'Filters Changed': props<{ filters: Partial<ProductFilters> }>(),
    'Create Product API Success': props<{ productId: string }>(),
    // === READ (AGGREGATED LOOKUPS) ---
    'Load Lookups': emptyProps(),
    'Load Lookups Success': props<{ lookups: ProductLookups }>(),
    'Load Lookups Failure': props<{ error: string }>(),

    // === READ (INDIVIDUAL ACTIONS, CALLED BY EFFECTS) ===
    'Load Products': props<{ filters: Partial<ProductFilters> }>(),
    'Load Products Success': props<{ products: Product[], totalCount: number }>(),
    'Load Products Failure': props<{ error: string }>(),
    'Load Custom Attribute Definitions Success': props<{ definitions: CustomAttributeDefinitionDto[] }>(),
    'Load Predefined Attributes Success': props<{ attributes: PredefinedAttributesMap }>(),
    'Load Display Specification Definitions Success': props<{ definitions: DisplaySpecificationDefinitionDto[] }>(),

    // === DETAIL VIEW ===
    'Product Detail Page Opened': props<{ productId: string }>(),
    'Load Product Detail': props<{ productId: string }>(),
    'Load Product Detail Success': props<{ product: Product }>(),
    'Load Product Detail Failure': props<{ error: string; productId: string }>(),    'Select Product': props<{ productId: string | null }>(),

    // --- Categories ---
    'Load Categories': emptyProps(),
    // << DE FIX: Payload versimpeld. De display map wordt in een selector afgeleid. >>
    'Load Categories Success': props<{ categories: ProductCategory[] }>(),
    'Load Categories Failure': props<{ error: string }>(),


    // === CREATE ===
    'Create Product Submitted': props<{ payload: CreateProductPayload; tempId: string }>(),
    'Create Product Success': props<{ product: Product }>(),
    'Create Product Failure': props<{ error: string }>(),

    // === UPDATE ===
    'Update Product Submitted': props<{ productId: string, payload: UpdateProductPayload }>(),
    'Update Product Success': props<{ productUpdate: Update<Product> }>(),
    'Update Product Failure': props<{ error: string }>(),

    // === UPDATE STOCK ===
    'Update Stock Submitted': props<{ productId: string, newStock: number }>(),
    'Update Stock Success': props<{ productUpdate: Update<Product> }>(),
    'Update Stock Failure': props<{ error: string }>(),

    // === DELETE ===
    'Delete Product Confirmed': props<{ productId: string }>(),
    'Delete Product Success': props<{ productId: string }>(),
    'Delete Product Failure': props<{ error: string }>(),
  },
});