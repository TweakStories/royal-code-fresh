/**
 * @file orders.feature.ts
 * @Version 4.0.0 (With Full Filter State)
 */
import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Order, OrderFilters } from '@royal-code/features/orders/domain';
import { OrderActions } from './orders.actions';

export const orderAdapter: EntityAdapter<Order> = createEntityAdapter<Order>();

export interface OrdersState extends EntityState<Order> {
  selectedOrderId: string | null;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  filters: OrderFilters;
}

export const initialOrdersState: OrdersState = orderAdapter.getInitialState({
  selectedOrderId: null,
  totalCount: 0,
  isLoading: false,
  error: null,
  filters: { status: 'all' }, // Default filter
});

const ordersReducerInternal = createReducer(
  initialOrdersState,
  on(OrderActions.orderHistoryPageOpened, (state) => ({ ...state, isLoading: true })),
  on(OrderActions.filtersChanged, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters },
    isLoading: true, // Zet loading op true, want een effect zal nu data laden
  })),
  on(OrderActions.loadOrders, (state) => ({ ...state, isLoading: true, error: null })),
  on(OrderActions.loadOrdersSuccess, (state, { orders, totalCount }) =>
    orderAdapter.setAll([...orders], { ...state, totalCount, isLoading: false })
  ),
  on(OrderActions.loadOrdersFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
);

export const ordersFeature = createFeature({
  name: 'orders',
  reducer: ordersReducerInternal,
  extraSelectors: ({ selectEntities, selectSelectedOrderId, selectOrdersState, selectFilters }) => { 
    const { selectAll } = orderAdapter.getSelectors(selectOrdersState);

    return {
      selectAllOrders: selectAll,
      selectSelectedOrder: createSelector( 
        selectEntities,
        selectSelectedOrderId,
        (entities, selectedId) => (selectedId ? entities[selectedId] : null)
      ),
      selectFilters, 
    };
  },
});

export const {
  name: ORDERS_FEATURE_KEY,
  reducer: ordersReducer,
  selectIsLoading,
  selectError,
  selectAllOrders,
  selectFilters,
  selectSelectedOrder,
} = ordersFeature;
