/**
 * @file cart.types.ts
 * @Version 9.0.0 (Type-Safe with SyncStatus Enum)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-29
 * @description Defines the strict type contracts for the Cart feature.
 */
import { CartItem as DomainCartItem } from '@royal-code/features/cart/domain';
import { Product } from '@royal-code/features/products/domain';
import { CartItemVariant } from '@royal-code/features/cart/domain'; 
import { SyncStatus } from '@royal-code/shared/domain';

// --- STATE & PAYLOADS ---
export interface CartItem extends DomainCartItem {
  syncStatus: SyncStatus;
  error?: string | null;
}

export type AddCartItemPayload = {
  readonly productId: string;
  readonly quantity: number;
  readonly variantId?: string | null;
  readonly productName?: string;
  readonly productImageUrl?: string | null;
  readonly pricePerItem?: number;
  readonly selectedVariants?: CartItemVariant[];
};

export type UpdateCartItemPayload = {
  readonly quantity: number;
};

// --- VIEW MODELS ---
export interface CartItemViewModel extends CartItem {
  readonly product: Product;
  readonly productName: string;
  readonly productImageUrl: string | undefined;
  readonly pricePerItem: number | undefined;
  readonly lineTotal: number;
}
export interface CartSummary {
  readonly totalItemCount: number;
  readonly uniqueItemCount: number;
  readonly subTotal: number;
  readonly totalDiscountAmount: number;
  readonly isEligibleForFreeShipping: boolean;
  readonly shippingCost: number;
  readonly totalWithShipping: number;
  readonly totalVatAmount: number;
}
export interface CartViewModel extends CartSummary {
  readonly items: readonly CartItemViewModel[];
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly isEmpty: boolean;
  readonly optimisticItemIds: ReadonlySet<string>;
}
