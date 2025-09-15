/**
 * @file admin-products.types.ts
 * @Version 1.7.0 (Definitive Readonly Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description Definitive type definitions. All array properties in the ViewModel are now
 *              correctly marked as `readonly` to ensure full type compatibility with NgRx state.
 */
import { Product, ProductCategory, ProductFilters } from '@royal-code/features/products/domain';
import { PredefinedAttributesMap, CustomAttributeDefinitionDto, DisplaySpecificationDefinitionDto } from '@royal-code/features/products/domain';

export interface AdminProductListViewModel {
  readonly products: readonly Product[];
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly filters: Partial<ProductFilters>;
  readonly totalCount: number;
  readonly predefinedAttributes: PredefinedAttributesMap | null;
  readonly isLoadingAttributes: boolean;
  readonly attributeNames: readonly string[];
  readonly customAttributeDefinitions: readonly CustomAttributeDefinitionDto[];
  readonly isLoadingCustomAttributeDefinitions: boolean;
  readonly displaySpecificationDefinitions: readonly DisplaySpecificationDefinitionDto[];
  readonly isLoadingDisplaySpecificationDefinitions: boolean;
  readonly selectedProduct: Product | undefined;
  readonly isLoadingCategories: boolean;
  readonly allCategories: readonly ProductCategory[];
  readonly categoryDisplayMap?: Map<string, string>;
}