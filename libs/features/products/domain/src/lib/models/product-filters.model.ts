// --- VERVANG VOLLEDIG BESTAND: libs/features/products/domain/src/lib/models/product-filters.model.ts ---
/**
 * @file product-filters.model.ts
 * @Version 2.1.0 (Unified Enterprise Standard - Droneshop Filters Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   Defines the single, authoritative `ProductFilters` interface for all
 *   product-related queries. This model includes pagination, sorting, and
 *   feature-specific filtering options, serving as the consistent contract
 *   between UI components, NgRx state, and data-access layers.
 *   Now includes Droneshop-specific filters and definitions for dynamic filter UIs.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-30
 * @PromptSummary Regenerated all modified files with clean comments and integrated filter/sort functionality.
 */
import { Product } from './product.model';
import { ProductStatus, ProductType, StockStatus } from '../types/product-types.enum';

/**
 * @interface ProductFilters
 * @description Defines the criteria for filtering and sorting product collections.
 */
export interface ProductFilters {
  readonly searchTerm?: string;
  readonly categoryIds?: readonly string[];
  readonly brandIds?: readonly string[]; // Wordt gebruikt voor backend 'brands' parameter
  readonly tags?: readonly string[];
  readonly productTypes?: readonly ProductType[];
  readonly statuses?: readonly ProductStatus[];
  readonly appScope?: string | null;
  readonly priceRange?: {
    readonly min?: number;
    readonly max?: number;
    readonly currency?: string;
  };
  readonly onSaleOnly?: boolean;
  readonly stockStatuses?: readonly StockStatus[];
  readonly inStockOnly?: boolean;
  readonly minimumRating?: number;
  readonly isFeatured?: boolean;
  readonly hasReviewsOnly?: boolean;
  readonly createdAfter?: string; // ISO string
  readonly publishedAfter?: string; // ISO string

  // === Nieuw voor Droneshop filters ===
  readonly skillLevels?: readonly ('beginner' | 'advanced' | 'professional')[];
  readonly hasCamera?: boolean;
  // === Einde nieuwe Droneshop filters ===

  // Sorting & Pagination
  readonly sortBy?: keyof Product | string;
  readonly sortDirection?: 'asc' | 'desc';
  readonly page?: number;
  readonly pageSize?: number;
}

/**
 * @interface FilterOption
 * @description Representeert een enkele optie binnen een filter, inclusief display-informatie en count.
 */
export interface FilterOption {
  value: string; // De werkelijke waarde die naar de backend wordt gestuurd (bv. ID of naam)
  label: string; // Display naam voor de UI
  count: number; // Aantal producten dat aan deze filteroptie voldoet
}

/**
 * @interface FilterDefinition
 * @description Definieert een filtercategorie, inclusief zijn type en beschikbare opties of range.
 */
export interface FilterDefinition {
  key: keyof ProductFilters; // De key die gebruikt wordt in ProductFilters (bv. 'brandIds', 'priceRange')
  label: string; // Display label voor de UI (bv. 'Merk', 'Prijs')
  type: 'checkbox' | 'range' | 'switch'; // Het type UI control voor dit filter
  options?: FilterOption[]; // Voor 'checkbox' en 'switch' types
  rangeMin?: number; // Voor 'range' type
  rangeMax?: number; // Voor 'range' type
}

/**
 * @typedef AvailableFiltersResponse
 * @description Het verwachte response formaat van de backend voor het ophalen van beschikbare filters.
 */
export type AvailableFiltersResponse = FilterDefinition[];