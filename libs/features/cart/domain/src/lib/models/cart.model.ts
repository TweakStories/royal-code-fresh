/**
 * @file cart.model.ts
 * @Version 2.1.0 (Discount Support)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-08
 * @Description Defines the core domain models for the Shopping Cart feature, now including discount support.
 */
import { SyncStatus } from '@royal-code/shared/domain';


export interface CartItemVariant {
  name: string; // 'Kleur' of 'Maat'
  value: string; // 'Geel' of 'Medium'
  displayValue?: string; // Optioneel, bijv. een hex-code voor een kleur
}

/** @interface CartItem - Represents a single item in the shopping cart. */
export interface CartItem {
  readonly id: string;
  readonly productId: string;
  quantity: number;
  productName?: string;
  productImageUrl?: string;
  pricePerItem?: number;
  lineTotal?: number;
  variantId?: string | null;
  selectedVariants?: CartItemVariant[];
  syncStatus?: SyncStatus;
}


/** @interface Cart - Represents the entire shopping cart object. */
export interface Cart {
  id: string;
  userId?: string | null;
  items: readonly CartItem[];
  subTotal?: number;
  shippingCost?: number;
  totalWithShipping?: number;
  totalVatAmount?: number;
  totalDiscountAmount?: number;
}
