/**
 * @file product-base.model.ts - DEFINITIVE AND CORRECTED VERSION
 * @Version 2.1.0 - Aligned with DTO Nullability and ensures all common properties exist.
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-20
 * @Description This version consolidates common properties from backend DTOs into ProductBase,
 *              making them optional where they might be absent or null, solving type assignment errors.
 *              It also maintains `categoryIds` to prevent TS2353.
 */
import { Media } from '@royal-code/shared/domain';
import { ProductStatus, ProductType, StockStatus } from '../types/product-types.enum';
import { ProductVariantCombination, VariantAttribute } from './product-variants.model';
import { Review } from '@royal-code/features/reviews/domain';
import { AuditableEntityBase, DateTimeInfo } from '@royal-code/shared/base-models';
 // Nodig voor StockStatus

export interface ProductColorVariantTeaser {
  readonly uiId: number;
  readonly attributeValueId: string;
  readonly defaultVariantId: string;
  readonly value: string;
  readonly displayName: string;
  readonly colorHex?: string | null;
  readonly price: number;
  readonly originalPrice?: number | null;
  readonly media?: readonly Media[] | null;
  readonly isDefault?: boolean; // <-- TOEGEVOEGD: Deze property ontbrak
}

export interface ProductBase extends AuditableEntityBase {
  readonly id: string;
  name: string;
  slug?: string | null; // Allow null for slug
  readonly type: ProductType;
  status: ProductStatus;

  shortDescription?: string | null; // Allow null
  description: string;

  media?: readonly Media[] | null; // Allow null
  currency?: string | null; // Allow null
  colorVariants?: readonly ProductColorVariantTeaser[] | null; // Allow null
  categoryIds: string[]; // This property remains mandatory and non-null in ProductBase
  tags?: readonly string[] | null; // Allow null

  variantAttributes?: readonly VariantAttribute[] | null; // Allow null
  variantCombinations?: readonly ProductVariantCombination[] | null; // Allow null

  // --- COMMERCE PROPERTIES (Added/Adjusted to solve NG9 errors on ProductListComponent) ---
  price?: number | null; // Make optional and allow null
  originalPrice?: number | null; // Make optional and allow null
  hasDiscount?: boolean; // Make optional
  discountPercentage?: number | null; // Make optional and allow null
  stockStatus?: StockStatus | null; // Make optional and allow null
  inStock?: boolean; // Make optional
  stockQuantity?: number | null; // Make optional and allow null

  // Reviews & Ratings
  averageRating?: number | null; // Allow null
  reviewCount?: number;

  // Visibility & Lifecycle
  isActive: boolean;
  isFeatured?: boolean;
  isNewUntil?: DateTimeInfo | null;

  // Analytics
  totalSalesCount?: number;
  viewCount?: number;

  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;

  publishedAt?: DateTimeInfo | null;
  archivedAt?: DateTimeInfo | null;
  discontinuedAt?: DateTimeInfo | null;
  lastModifiedBy?: string | null;

  // Relationships & Inventory Hints
  relatedProductIds?: string[] | null;
  restockDate?: DateTimeInfo | null;

  // Pricing (Internal - these were already optional, good)
  costPrice?: number;
  profitMarginPercent?: number;

  // Pragmatic Enterprise Touches
  searchKeywords?: string[] | null;
  customAttributes?: Record<string, unknown> | null;
  appScope?: string | null;

    // === Tijdelijke eigenschap voor data-overdracht ===
  // @TODO remove this later
    _mediaMap?: Map<string, Media[]>; 

}
