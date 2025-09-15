/**
 * @file admin-orders.actions.ts
 * @version 5.0.0 (Removed 'view' parameter from Load Order Detail)
 * @description NgRx‑actions voor Admin Orders, nu zonder de 'view' parameter in Load Order Detail actie.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { Order, OrderFilters, OrderStatus } from '@royal-code/features/orders/domain';
import { AdminOrderLookups, AdminOrderStats } from '@royal-code/features/admin-orders/domain';
import { Address } from '@royal-code/shared/domain';
import {
  AddOrderItemPayloadDto,
  UpdateOrderItemQuantityPayloadDto,
  CreateFulfillmentPayloadDto,
  RefundOrderPayloadDto,
  UpdateOrderStatusPayloadDto
} from '../DTOs/backend.dto';

export const AdminOrdersActions = createActionGroup({
  source: 'Admin/Orders',
  events: {
    // --- LEEGSLAG & FILTERS ---
    'Page Initialized': emptyProps(),
    'Filters Changed': props<{ filters: Partial<OrderFilters> }>(),
    'Load Orders': props<{ filters: Partial<OrderFilters> }>(),
    'Load Orders Success': props<{ orders: readonly Order[]; totalCount: number }>(),
    'Load Orders Failure': props<{ error: string }>(),

    // --- STATS & LOOKUPS ---
    'Load Stats': props<{ dateFrom?: string; dateTo?: string }>(),
    'Load Stats Success': props<{ stats: AdminOrderStats }>(),
    'Load Stats Failure': props<{ error: string }>(),
    'Load Lookups': emptyProps(),
    'Load Lookups Success': props<{ lookups: AdminOrderLookups }>(),
    'Load Lookups Failure': props<{ error: string }>(),

    // --- DETAIL VIEW ---
    'Order Detail Page Opened': props<{ orderId: string }>(),
    // << DE FIX: 'view' parameter verwijderd uit Load Order Detail >>
    'Load Order Detail': props<{ orderId: string }>(),
    'Load Order Detail Success': props<{ order: Order }>(),
    'Load Order Detail Failure': props<{ error: string }>(),
    'Select Order': props<{ orderId: string | null }>(),

    // --- MUTATIONS ---
    'Update Status Submitted': props<{ orderId: string; payload: UpdateOrderStatusPayloadDto }>(),
    'Update Shipping Address Submitted': props<{ orderId: string; payload: Address }>(),
    'Update Billing Address Submitted': props<{ orderId: string; payload: Address }>(),
    'Update Internal Notes Submitted': props<{ orderId: string; notes: string }>(),
    'Update Customer Notes Submitted': props<{ orderId: string; notes: string }>(),
    'Cancel Order Confirmed': props<{ orderId: string }>(),
    'Refund Order Submitted': props<{ orderId: string; payload: RefundOrderPayloadDto }>(),
    'Create Fulfillment Submitted': props<{ orderId: string; payload: CreateFulfillmentPayloadDto }>(),
    'Add Item To Order Submitted': props<{ orderId: string; payload: AddOrderItemPayloadDto }>(),
    'Update Order Item Submitted': props<{ orderId: string; orderItemId: string; payload: UpdateOrderItemQuantityPayloadDto }>(),
    'Remove Order Item Submitted': props<{ orderId: string; orderItemId: string }>(),
    'Mutation Success': props<{ orderUpdate: Update<Order> }>(),
    'Mutation Failure': props<{ error: string }>(),

    // --- DOCUMENTEN ---
    'Download Invoice Submitted': props<{ orderId: string; orderNumber: string }>(),
    'Download Packing Slip Submitted': props<{ orderId: string; orderNumber: string }>(),
    'Export Orders Submitted': props<{ filters: Partial<OrderFilters> }>()
  }
});