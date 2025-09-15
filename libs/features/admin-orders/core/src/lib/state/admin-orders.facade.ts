/**
 * @file admin-orders.facade.ts
 * @version 4.0.0 (Removed Quick Ship Details Method)
 * @description Facade voor Admin Orders, nu zonder de problematische 'Quick Ship Details' methode.
 */
import { Injectable, inject, computed, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { OrderFilters, OrderStatus } from '@royal-code/features/orders/domain';
import { Address } from '@royal-code/shared/domain';
import {
  AddOrderItemPayloadDto,
  UpdateOrderItemQuantityPayloadDto,
  CreateFulfillmentPayloadDto,
  RefundOrderPayloadDto,
  UpdateOrderStatusPayloadDto
} from '../DTOs/backend.dto';
import { AdminOrdersActions } from './admin-orders.actions';
import { adminOrdersFeature } from './admin-orders.feature';

@Injectable({ providedIn: 'root' })
export class AdminOrdersFacade {
  private readonly store = inject(Store);

  // --- SELECTORS ---
  readonly isLoading = this.store.selectSignal(adminOrdersFeature.selectIsLoading);
  readonly isSubmitting: Signal<boolean> = this.store.selectSignal(adminOrdersFeature.selectIsSubmitting);
  readonly lookups = this.store.selectSignal(adminOrdersFeature.selectLookups);
  readonly selectedOrder = this.store.selectSignal(adminOrdersFeature.selectSelectedOrder);
  // Removed selectLoadingAccordionForId as it's no longer used.

  // --- VIEWMODEL ---
  readonly viewModel = this.store.selectSignal(adminOrdersFeature.selectViewModel);

  // --- LIFECYCLE ---
  init() {
    this.store.dispatch(AdminOrdersActions.pageInitialized());
  }
  changeFilters(filters: Partial<OrderFilters>) {
    this.store.dispatch(AdminOrdersActions.filtersChanged({ filters }));
  }
  selectOrder(orderId: string | null) {
    this.store.dispatch(AdminOrdersActions.selectOrder({ orderId }));
  }
  openOrderDetailPage(orderId: string) {
    this.store.dispatch(AdminOrdersActions.orderDetailPageOpened({ orderId }));
  }

  // Removed loadOrderQuickShipDetails as it's no longer used.


  // --- MUTATIONS ---
  updateStatus(orderId: string, newStatus: OrderStatus, trackingNumber?: string, trackingUrl?: string) {
    const payload: UpdateOrderStatusPayloadDto = { newStatus, trackingNumber, trackingUrl };
    this.store.dispatch(AdminOrdersActions.updateStatusSubmitted({ orderId, payload }));
  }
  updateShippingAddress(orderId: string, payload: Address) {
    this.store.dispatch(AdminOrdersActions.updateShippingAddressSubmitted({ orderId, payload }));
  }
  updateBillingAddress(orderId: string, payload: Address) {
    this.store.dispatch(AdminOrdersActions.updateBillingAddressSubmitted({ orderId, payload }));
  }
  updateInternalNotes(orderId: string, notes: string) {
    this.store.dispatch(AdminOrdersActions.updateInternalNotesSubmitted({ orderId, notes }));
  }
  updateCustomerNotes(orderId: string, notes: string) {
    this.store.dispatch(AdminOrdersActions.updateCustomerNotesSubmitted({ orderId, notes }));
  }
  cancelOrder(orderId: string) {
    this.store.dispatch(AdminOrdersActions.cancelOrderConfirmed({ orderId }));
  }
  refundOrder(orderId: string, amount: number, reason: string) {
    const payload: RefundOrderPayloadDto = { amount, reason };
    this.store.dispatch(AdminOrdersActions.refundOrderSubmitted({ orderId, payload }));
  }
  createFulfillment(orderId: string, payload: CreateFulfillmentPayloadDto) {
    this.store.dispatch(AdminOrdersActions.createFulfillmentSubmitted({ orderId, payload }));
  }
  addItemToOrder(orderId: string, payload: AddOrderItemPayloadDto) {
    this.store.dispatch(AdminOrdersActions.addItemToOrderSubmitted({ orderId, payload }));
  }
  updateOrderItem(orderId: string, orderItemId: string, quantity: number) {
    const payload: UpdateOrderItemQuantityPayloadDto = { quantity };
    this.store.dispatch(AdminOrdersActions.updateOrderItemSubmitted({ orderId, orderItemId, payload }));
  }
  removeOrderItem(orderId: string, orderItemId: string) {
    this.store.dispatch(AdminOrdersActions.removeOrderItemSubmitted({ orderId, orderItemId }));
  }

  // --- DOCUMENTEN ---
  downloadInvoice(orderId: string, orderNumber: string) {
    this.store.dispatch(AdminOrdersActions.downloadInvoiceSubmitted({ orderId, orderNumber }));
  }
  downloadPackingSlip(orderId: string, orderNumber: string) {
    this.store.dispatch(AdminOrdersActions.downloadPackingSlipSubmitted({ orderId, orderNumber }));
  }
  exportOrders(filters: Partial<OrderFilters>) {
    this.store.dispatch(AdminOrdersActions.exportOrdersSubmitted({ filters }));
  }
}