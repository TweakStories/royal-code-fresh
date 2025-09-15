/**
 * @file admin-orders.feature.ts
 * @Version 3.0.0 (Definitive State - Removed Quick Ship Details)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Definitive NgRx feature for Admin Orders, now cleaned of the problematic
 *   'Quick Ship Details' related state and actions, ensuring consistent data.
 */
import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Order, OrderFilters } from '@royal-code/features/orders/domain';
import { AdminOrderLookups, AdminOrderStats } from '@royal-code/features/admin-orders/domain';
import { AdminOrdersActions } from './admin-orders.actions';

export const ADMIN_ORDERS_FEATURE_KEY = 'adminOrders';

export interface AdminOrdersState extends EntityState<Order> {
  stats: AdminOrderStats | null;
  lookups: AdminOrderLookups | null;
  totalCount: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  filters: Partial<OrderFilters>;
  selectedOrderId: string | null;
  // Removed loadingAccordionForId
}

export const adapter: EntityAdapter<Order> = createEntityAdapter<Order>();

export const initialState: AdminOrdersState = adapter.getInitialState({
  stats: null,
  lookups: null,
  totalCount: 0,
  isLoading: true,
  isSubmitting: false,
  error: null,
  filters: { page: 1, pageSize: 20, status: 'all' },
  selectedOrderId: null,
  // Removed loadingAccordionForId
});

const reducer = createReducer(
  initialState,

  // --- LOAD LOOKUPS & STATS ---
  on(AdminOrdersActions.loadLookupsSuccess, (state, { lookups }) => ({ ...state, lookups })),
  on(AdminOrdersActions.loadStatsSuccess, (state, { stats }) => ({ ...state, stats })),

   // --- LIST PULL ---
 on(AdminOrdersActions.loadOrders, state => ({ ...state, isLoading: true, error: null })),
on(AdminOrdersActions.loadOrdersSuccess, (state, { orders, totalCount }) =>
    // FIX: Converteer `orders` expliciet naar een mutable array voor `setAll`.
    // Dit is veilig, want `setAll` creëert een nieuwe staat; de originele `orders` (readonly) blijft onaangetast.
    adapter.setAll([...orders], { ...state, totalCount, isLoading: false }) // <-- HIER IS DE FIX
  ),
  on(AdminOrdersActions.loadOrdersFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

   // --- DETAIL PAGE ---
 on(AdminOrdersActions.orderDetailPageOpened, state => ({ ...state, isLoading: true, error: null })),
  on(AdminOrdersActions.loadOrderDetailSuccess, (state, { order }) =>
    adapter.upsertOne(order, { ...state, isLoading: false, selectedOrderId: order.id })
  ),
  on(AdminOrdersActions.loadOrderDetailFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
  on(AdminOrdersActions.selectOrder, (state, { orderId }) => ({ ...state, selectedOrderId: orderId })),

    // --- MUTATION CYCLE ---
on(
    AdminOrdersActions.updateStatusSubmitted,
    AdminOrdersActions.updateShippingAddressSubmitted,
    AdminOrdersActions.updateBillingAddressSubmitted,
    AdminOrdersActions.updateInternalNotesSubmitted,
    AdminOrdersActions.updateCustomerNotesSubmitted,
    AdminOrdersActions.cancelOrderConfirmed,
    AdminOrdersActions.refundOrderSubmitted,
    AdminOrdersActions.createFulfillmentSubmitted,
    AdminOrdersActions.addItemToOrderSubmitted,
    AdminOrdersActions.updateOrderItemSubmitted,
    AdminOrdersActions.removeOrderItemSubmitted,
    state => ({ ...state, isSubmitting: true, error: null })
  ),
  on(AdminOrdersActions.mutationSuccess, (state, { orderUpdate }) =>
    adapter.updateOne(orderUpdate, { ...state, isSubmitting: false })
  ),
  on(AdminOrdersActions.mutationFailure, (state, { error }) => ({ ...state, isSubmitting: false, error }))
);

export const adminOrdersFeature = createFeature({
  name: ADMIN_ORDERS_FEATURE_KEY,
  reducer,
  extraSelectors: ({
    selectAdminOrdersState,
    selectSelectedOrderId,
    selectStats,
    selectLookups,
    selectIsLoading,
    selectIsSubmitting,
    selectError,
    selectFilters,
    selectTotalCount,
    // Removed selectLoadingAccordionForId
  }) => {
    const { selectAll, selectEntities } = adapter.getSelectors();

    const selectAllOrders = createSelector(selectAdminOrdersState, selectAll);
    const selectOrderEntities = createSelector(selectAdminOrdersState, selectEntities);

    const selectSelectedOrder = createSelector(
      selectOrderEntities,
      selectSelectedOrderId,
      (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
    );

    const selectViewModel = createSelector(
      selectAllOrders,
      selectStats,
      selectLookups,
      selectIsLoading,
      selectIsSubmitting,
      selectError,
      selectFilters,
      selectTotalCount,
      (orders, stats, lookups, isLoading, isSubmitting, error, filters, totalCount) => ({
        orders,
        stats,
        lookups,
        isLoading,
        isSubmitting,
        error,
        filters,
        totalCount
      })
    );

    return {
      selectAllOrders,
      selectEntities: selectOrderEntities,
      selectSelectedOrder,
      selectViewModel
    };
  }
});

// --- EXPORT PUBLIC SELECTORS ---
export const {
  selectStats,
  selectLookups,
  selectIsLoading,
  selectIsSubmitting,
  selectError,
  selectFilters,
  selectTotalCount,
  // Removed selectLoadingAccordionForId
  selectAllOrders,
  selectEntities,
  selectSelectedOrder,
  selectViewModel
} = adminOrdersFeature;