/**
 * @file wishlist.model.ts
 * @Version 2.0.0 (Synchronized with Backend DTO)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description Defines the domain model for a wishlist item, now including variant attributes and explicit colorHex.
 */
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { StockStatus, VariantAttributeType } from '@royal-code/features/products/domain';

/**
 * @interface WishlistItemVariantAttribute
 * @description Represents a single selected attribute for a variant in the wishlist.
 */
export interface WishlistItemVariantAttribute {
  readonly attributeType: VariantAttributeType | string;
  readonly displayName: string;
  readonly value: string;
  readonly colorHex?: string | null; // << DE FIX: ColorHex hier als optionele string
}

/**
 * @interface WishlistItem
 * @description Represents a single item in a user's wishlist, fully aligned with the backend DTO.
 */
export interface WishlistItem {
  readonly id: string; // The unique ID of the wishlist entry itself (GUID from backend)
  readonly productId: string;
  readonly variantId?: string | null;
  readonly addedAt: DateTimeInfo;

  // Denormalized product data for UI display
  readonly productName: string;
  readonly productImageUrl?: string | null;
  readonly price: number;
  readonly originalPrice?: number | null;
  readonly currency: string;
  readonly stockStatus: StockStatus | string; // Kan string zijn indien direct van backend DTO
  readonly inStock: boolean;

  // NIEUW: De details van de geselecteerde variant.
  readonly variantAttributes?: readonly WishlistItemVariantAttribute[] | null;
}