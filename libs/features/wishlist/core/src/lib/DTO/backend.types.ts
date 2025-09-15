/**
 * @file backend.types.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description Backend DTOs for the Wishlist feature.
 */
import { StockStatus, VariantAttributeType } from '@royal-code/features/products/domain'; // Voor StockStatus en VariantAttributeType

// DTO voor een enkel geselecteerd attribuut van een variant.
export interface BackendWishlistItemVariantAttributeDto {
    attributeType: VariantAttributeType;
    displayName: string;
    value: string;
    colorHex?: string | null;
}

// DTO voor een wishlist item.
export interface BackendWishlistItemDto {
    id: string; // GUID van Wishlist Item
    productId: string; // GUID van Product
    variantId?: string | null; // GUID van Variant
    addedAt: string; // DateTimeOffset as ISO string
    productName: string;
    productImageUrl?: string | null;
    price: number; // Decimal
    originalPrice?: number | null; // Decimal
    currency: string;
    stockStatus: StockStatus; // Enum as string
    inStock: boolean;
    variantAttributes?: readonly BackendWishlistItemVariantAttributeDto[] | null;
}