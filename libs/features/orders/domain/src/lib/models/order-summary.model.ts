/**
 * @file order-summary.model.ts
 * @Version 3.0.0 (Deprecated in favor of full Order)
 * @Description This model is kept for potential future use where a lightweight summary
 *              is needed, but the primary API now returns full Order objects.
 */
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { OrderStatus } from './order.model';

export interface OrderSummary {
  readonly id: string;
  readonly orderNumber: string;
  readonly orderDate: DateTimeInfo;
  readonly status: OrderStatus;
  readonly grandTotal: number;
  readonly customerName: string;
  readonly productThumbnails: readonly string[];
  readonly totalItems: number;
}