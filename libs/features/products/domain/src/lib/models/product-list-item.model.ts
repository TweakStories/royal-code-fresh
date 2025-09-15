/**
 * @file product-list-item.model.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-13
 * @Description Defines the lightweight, explicit contract for a product in a list/grid view.
 */
import { Image } from '@royal-code/shared/domain';
import { ProductStatus, ProductType, StockStatus } from '../types/product-types.enum';

export interface ProductListItem {
  readonly id: string;
  readonly name: string;
  readonly type: ProductType;
  readonly status: ProductStatus;
  readonly hasDiscount: boolean;
  readonly isActive: boolean;
  readonly isFeatured: boolean;
  readonly reviewCount: number;
  readonly tags: readonly string[];
  readonly shortDescription?: string | null;
  readonly averageRating?: number | null;
  readonly price?: number | null;
  readonly originalPrice?: number | null;
  readonly currency?: string | null;
  readonly stockStatus?: StockStatus | null;
  readonly inStock?: boolean | null;
  readonly discountPercentage?: number | null;
  primaryImage?: Image['variants'][0] | null;
}
