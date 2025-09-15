/**
 * @file admin-orders.models.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-23
 * @Description Defines the frontend domain models for admin-specific order data like stats and lookups.
 */
import { OrderStatus } from '@royal-code/features/orders/domain';

export interface AdminOrderStats {
  readonly totalRevenue: number;
  readonly totalOrders: number;
  readonly averageOrderValue: number;
  readonly ordersAwaitingFulfillment: number;
  readonly newOrdersToday: number;
  readonly revenueToday: number;
}

export interface AdminOrderLookups {
  readonly orderStatuses: ReadonlyArray<OrderStatus | string>;
  readonly paymentMethods: readonly string[];
  readonly shippingMethods: readonly string[];
}