/**
 * @file order-payloads.model.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-19
 * @Description Defines the data transfer objects (payloads) for creating orders.
 */

/**
 * @interface CreateOrderItemPayload
 * @description The client-side representation of an item to be ordered.
 */
export interface CreateOrderItemPayload {
  readonly productId: string;
  readonly variantId?: string | null;
  readonly quantity: number;
}

/**
 * @interface CreateOrderPayload
 * @description The complete payload sent to the backend to create a new order.
 */
export interface CreateOrderPayload {
  readonly shippingAddressId: string;
  readonly billingAddressId: string; 
  readonly shippingMethodId: string; 
  readonly paymentMethod: string;
  readonly items: readonly CreateOrderItemPayload[];
  readonly customerNotes?: string;
}