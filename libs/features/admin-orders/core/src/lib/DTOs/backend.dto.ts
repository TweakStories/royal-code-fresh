// --- BACKEND DTO CONTRACTS ---
import { OrderStatus } from '@royal-code/features/orders/domain';
import { ProductType } from '@royal-code/features/products/domain';
import { PaginatedList } from '@royal-code/shared/utils';
import { Address } from '@royal-code/shared/domain';

/* LIST & LOOKUPS */
export type BackendPaginatedOrderListDto = PaginatedList<BackendAdminOrderListItemDto>;

export interface BackendAdminOrderListItemDto {
  readonly id: string;
  readonly orderNumber: string;
  readonly orderDate: string; // ISO string
  readonly status: string; // camelCase string, bijv. 'shipped'
  readonly paymentStatus: string;
  readonly grandTotal: number;
  readonly currency: string;
  readonly totalItems: number;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly hasCustomerNotes: boolean;
  readonly shippingSummary: { countryCode: string; methodName: string; trackingNumber: string | null; };
  readonly productThumbnails: readonly string[]; // Array van URL's
}

export interface BackendAdminOrderStatsDto {
  readonly totalRevenue: number;
  readonly totalOrders: number;
  readonly averageOrderValue: number;
  readonly ordersAwaitingFulfillment: number;
  readonly newOrdersToday: number;
  readonly revenueToday: number;
}
export interface BackendAdminLookupsDto {
  readonly orderStatuses: readonly string[];
  readonly paymentMethods: readonly string[];
  readonly shippingMethods: readonly string[];
}

/* DETAIL */
export interface BackendAdminOrderDetailDto {
  readonly id: string; 
  readonly orderNumber: string;
  readonly orderDate: string;
  readonly status: string;
  readonly customer: { userId: string; name: string; email: string };
  readonly financialSummary: {
    subTotal: number; shippingCost: number; taxAmount: number; discountAmount: number;
    grandTotal: number; currency: string;
  };
  readonly shippingAddress: Address;
  readonly billingAddress: Address;
  readonly paymentDetails?: { methodFriendlyName: string; gatewayTransactionId?: string; paymentStatus: string; };
  readonly items: readonly BackendOrderItemDto[];
  readonly customerNotes?: string;
  readonly internalNotes: readonly BackendInternalNoteDto[];
  readonly fulfillments: readonly BackendFulfillmentDto[];
  readonly history: readonly BackendHistoryEventDto[];
  readonly refunds: readonly BackendRefundDto[];
}

/* PICK‑PACK */
export interface BackendAdminOrderPickPackDto {
  readonly orderId: string;
  readonly shippingAddress: Address;
  readonly customerNotes?: string;
  readonly items: readonly {
    orderItemId: string; sku?: string; productName: string; variantInfo?: Record<string,string>; quantity: number; productImageUrl?: string;
  }[];
  readonly fulfillment?: { carrierName?: string; trackingNumber?: string; trackingUrl?: string; };
}

/* sub‑DTOs */
export interface BackendVariantDisplayInfoDto {
  readonly attributeType: string;
  readonly displayName: string;
  readonly value: string;
  readonly colorHex: string | null;
}

export interface BackendOrderItemDto {
  readonly id: string; readonly productId: string; readonly productVariantId?: string;
  readonly productName: string; readonly sku?: string; readonly productType: ProductType;
  readonly quantity: number; readonly pricePerItem: number; readonly lineTotal: number;
  readonly taxAmount: number; readonly discountAmount: number;
  readonly variantInfo?: readonly BackendVariantDisplayInfoDto[]; // Aangepast naar array van objecten
  readonly productImageUrl?: string;
}


export interface BackendInternalNoteDto { id: string; createdAt: string; authorName: string; text: string; }
export interface BackendFulfillmentDto {
  fulfillmentId: string; createdAt: string; status: string;
  carrierName?: string; trackingNumber?: string; trackingUrl?: string;
  shippedDate?: string; estimatedDeliveryDate?: string;
  items: readonly { orderItemId: string; quantity: number }[];
}
export interface BackendHistoryEventDto { timestamp: string; eventType: string; author: string; description: string; }
export interface BackendRefundDto { refundId: string; amount: number; reason: string; refundedAt: string; processedBy: string; gatewayRefundId?: string; }

/* PAYLOADS */
export interface UpdateOrderStatusPayloadDto { newStatus: OrderStatus; trackingNumber?: string; trackingUrl?: string; shippedDate?: string; estimatedDeliveryDate?: string; }
export interface UpdateOrderNotesPayloadDto { notes: string; }
export interface UpdateCustomerNotesPayloadDto { notes: string; }
export interface RefundOrderPayloadDto { amount: number; reason: string; }
export interface CreateFulfillmentItemDto { orderItemId: string; quantity: number; }
export interface CreateFulfillmentPayloadDto { carrierName?: string; trackingNumber?: string; trackingUrl?: string; items: CreateFulfillmentItemDto[]; }
export interface AddOrderItemPayloadDto { productId: string; variantId?: string; quantity: number; }
export interface UpdateOrderItemQuantityPayloadDto { quantity: number; }
