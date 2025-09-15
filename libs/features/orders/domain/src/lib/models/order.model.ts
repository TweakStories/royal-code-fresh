// --- ORDER DOMAIN MODEL ---
/**
 * Definitive Order-domain, volledig gesynchroniseerd met de backend‑Swagger.
 */
import { ProductType } from '@royal-code/features/products/domain';
import { AuditableEntityBase, DateTimeInfo } from '@royal-code/shared/base-models';
import { Address } from '@royal-code/shared/domain';

export enum OrderStatus {
  pendingPayment      = 'pendingPayment',
  paymentFailed       = 'paymentFailed',
  awaitingFulfillment = 'awaitingFulfillment',
  processing          = 'processing',
  shipped             = 'shipped',
  inTransit           = 'inTransit',
  delivered           = 'delivered',
  completed           = 'completed',
  cancelled           = 'cancelled',
  refundPending       = 'refundPending',
  partiallyRefunded   = 'partiallyRefunded',
  fullyRefunded       = 'fullyRefunded',
  onHold              = 'onHold',
}

// --- sub‑types ---
export interface OrderItem {
  readonly id: string;
  readonly productId: string;
  readonly productVariantId?: string | null;
  readonly productName: string;
  readonly productType: ProductType | 'physical';
  quantity: number;
  pricePerItem: number;
  readonly lineTotal: number;
  readonly productImageUrl?: string | null;
  readonly sku?: string | null;
  readonly taxAmount?: number;
  readonly discountAmount?: number;
  readonly variantInfo?: readonly VariantDisplayInfo[];
}

export interface VariantDisplayInfo {
  readonly attributeType: string;
  readonly displayName: string;
  readonly value: string;
  readonly colorHex?: string | null;
}


export interface InternalNote {
  readonly id: string;
  readonly createdAt: DateTimeInfo;
  readonly authorName: string;
  readonly text: string;
}

export interface FulfillmentItem {
  readonly orderItemId: string;
  readonly quantity: number;
}

export interface Fulfillment {
  readonly fulfillmentId: string;
  readonly createdAt: DateTimeInfo;
  readonly status: string;
  readonly carrierName?: string;
  readonly trackingNumber?: string;
  readonly trackingUrl?: string;
  readonly shippedDate?: DateTimeInfo | null;
  readonly estimatedDeliveryDate?: DateTimeInfo | null;
  readonly items: readonly FulfillmentItem[];
}

export interface HistoryEvent {
  readonly timestamp: DateTimeInfo;
  readonly eventType: string;
  readonly author: string;
  readonly description: string;
}

export interface Refund {
  readonly refundId: string;
  readonly amount: number;
  readonly reason: string;
  readonly refundedAt: DateTimeInfo;
  readonly processedBy: string;
  readonly gatewayRefundId?: string;
}

// --- root entity ---
export interface Order extends AuditableEntityBase {
  readonly id: string;
  readonly orderNumber: string;
  readonly userId: string;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly orderDate: DateTimeInfo;
  status: OrderStatus;

  readonly items: readonly OrderItem[];
  readonly totalItems: number;

  readonly subTotal: number;
  readonly shippingCost: number;
  readonly discountAmount: number;
  readonly taxAmount: number;
  readonly grandTotal: number;
  readonly currency: string;

  shippingAddress?: Address;
  billingAddress?: Address;

  readonly shippingDetails?: {
    methodName: string;
    cost?: number;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    shippedDate?: DateTimeInfo | null;
    estimatedDeliveryDate?: DateTimeInfo | null;
  };

  readonly paymentDetails?: {
    methodFriendlyName: string;
    gatewayTransactionId?: string;
    paymentStatus: string;
  };

  customerNotes?: string;
  internalNotes?: readonly InternalNote[];

  readonly productThumbnails: readonly string[];

  readonly fulfillments: readonly Fulfillment[];
  readonly history: readonly HistoryEvent[];
  readonly refunds: readonly Refund[];
}
