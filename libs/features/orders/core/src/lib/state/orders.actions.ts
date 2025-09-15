/**
 * @file orders.actions.ts
 * @Version 2.1.0 (With Full Filter Logic)
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Order, OrderFilters, CreateOrderPayload } from '@royal-code/features/orders/domain';

export const OrderActions = createActionGroup({
  source: 'Orders',
  events: {
    // --- Page Lifecycle & Context Management ---
    'Order History Page Opened': emptyProps(),
    'Filters Changed': props<{ filters: Partial<OrderFilters> }>(),

    // --- API Loading: List ---
    'Load Orders': props<{ page: number; pageSize: number; filters: Partial<OrderFilters> }>(),
    'Load Orders Success': props<{ orders: readonly Order[]; totalCount: number }>(),
    'Load Orders Failure': props<{ error: string }>(),

    // --- Order Detail (voor specifieke refresh/selectie) ---
    'Order Detail Page Opened': props<{ orderId: string }>(), // Blijft voor potentieel deeplinken
    'Load Order Detail Success': props<{ order: Order }>(),
    'Load Order Detail Failure': props<{ error: string }>(),

    // --- Order Creation Flow ---
    'Create Order From Checkout': props<{ payload: CreateOrderPayload }>(),
    'Create Order Success': props<{ order: Order }>(),
    'Create Order Failure': props<{ error: string }>(),
  }
});