// --- PLAATS DIT IN: libs/features/orders/core/src/lib/state/orders.facade.ts ---
/**
 * @file orders.facade.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-19
 * @Description Public API for the Orders state.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 */
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { OrderActions } from './orders.actions';
import { selectIsLoading, selectError,  selectSelectedOrder, selectAllOrders } from './orders.feature';
import { OrderFilters } from '@royal-code/features/orders/domain';
import { selectTotalCount } from '@royal-code/features/admin-products/core';

@Injectable({ providedIn: 'root' })
export class OrdersFacade {
  private readonly store = inject(Store);

  readonly isLoading$ = this.store.select(selectIsLoading);
  readonly error$ = this.store.select(selectError);
  readonly orderHistory$ = this.store.select(selectAllOrders);
  readonly selectedOrder$ = this.store.select(selectSelectedOrder);
  readonly totalOrdersCount = this.store.selectSignal(selectTotalCount);


  loadOrderHistory(page = 1, pageSize = 10): void {
    this.store.dispatch(OrderActions.loadOrders({ page, pageSize, filters: {} }));
  }

  changeFilters(filters: Partial<OrderFilters>): void {
    this.store.dispatch(OrderActions.filtersChanged({ filters }));
  }

  viewOrderDetail(orderId: string): void {
    this.store.dispatch(OrderActions.orderDetailPageOpened({ orderId }));
  }

}
