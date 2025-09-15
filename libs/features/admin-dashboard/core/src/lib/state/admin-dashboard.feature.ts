/**
 * @file admin-dashboard.feature.ts
 * @Version 2.0.0 (Definitive createFeature Refactor)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description The main NgRx feature definition for the Admin Dashboard.
 *              Refactored to define the ViewModel selector outside of createFeature
 *              to prevent all 'implicitly has an any type' errors.
 */
import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { initialAdminDashboardState } from './admin-dashboard.state'; // FIX: Correcte import
import { AdminDashboardActions } from './admin-dashboard.actions';
import { AdminDashboardViewModel } from './admin-dashboard.types';

export const ADMIN_DASHBOARD_FEATURE_KEY = 'adminDashboard';

export const adminDashboardFeature = createFeature({
  name: ADMIN_DASHBOARD_FEATURE_KEY,
  reducer: createReducer(
    initialAdminDashboardState,
    on(AdminDashboardActions.pageInitialized, (state) => ({
      ...state,
      isLoadingStats: true,
      isLoadingChart: true,
      isLoadingBestsellers: true,
      isLoadingRecentOrders: true,
      isLoadingPendingReviews: true,
      error: null,
    })),
    on(AdminDashboardActions.loadStatsSuccess, (state, { stats }) => ({ ...state, stats, isLoadingStats: false })),
    on(AdminDashboardActions.loadStatsFailure, (state, { error }) => ({ ...state, isLoadingStats: false, error })),
    on(AdminDashboardActions.loadRevenueChartSuccess, (state, { chartData }) => ({ ...state, revenueChartData: chartData, isLoadingChart: false })),
    on(AdminDashboardActions.loadRevenueChartFailure, (state, { error }) => ({ ...state, isLoadingChart: false, error })),
    on(AdminDashboardActions.loadBestsellersSuccess, (state, { bestsellers }) => ({ ...state, bestsellers, isLoadingBestsellers: false })),
    on(AdminDashboardActions.loadBestsellersFailure, (state, { error }) => ({ ...state, isLoadingBestsellers: false, error })),
    on(AdminDashboardActions.loadRecentOrdersSuccess, (state, { orders }) => ({ ...state, recentOrders: orders.items, isLoadingRecentOrders: false })),
    on(AdminDashboardActions.loadRecentOrdersFailure, (state, { error }) => ({ ...state, isLoadingRecentOrders: false, error })),
    on(AdminDashboardActions.loadPendingReviewsSuccess, (state, { reviews }) => ({ ...state, pendingReviews: reviews.items, isLoadingPendingReviews: false })),
    on(AdminDashboardActions.loadPendingReviewsFailure, (state, { error }) => ({ ...state, isLoadingPendingReviews: false, error })),
    on(AdminDashboardActions.clearError, (state) => ({ ...state, error: null }))
  )
});

// === EXPORTED SELECTORS (DEFINITIEVE FIX) ===

// 1. Exporteer de basis selectors die `createFeature` genereert.
export const {
  name,
  reducer,
  selectAdminDashboardState,
  selectStats,
  selectRevenueChartData,
  selectBestsellers,
  selectRecentOrders,
  selectPendingReviews,
  selectIsLoadingStats,
  selectIsLoadingChart,
  selectIsLoadingBestsellers,
  selectIsLoadingRecentOrders,
  selectIsLoadingPendingReviews,
  selectError,
} = adminDashboardFeature;

// 2. Creëer de gecombineerde selectors buiten de `createFeature` call.
export const selectIsLoading = createSelector(
  selectIsLoadingStats,
  selectIsLoadingChart,
  selectIsLoadingBestsellers,
  selectIsLoadingRecentOrders,
  selectIsLoadingPendingReviews,
  (stats, chart, bestsellers, orders, reviews) => stats || chart || bestsellers || orders || reviews
);

export const selectViewModel = createSelector(
  selectStats,
  selectRevenueChartData,
  selectBestsellers,
  selectRecentOrders,
  selectPendingReviews,
  selectIsLoading,
  selectError,
  (stats, revenueChartData, bestsellers, recentOrders, pendingReviews, isLoading, error): AdminDashboardViewModel => ({
    stats,
    revenueChartData,
    bestsellers,
    recentOrders,
    pendingReviews,
    isLoading,
    error,
  })
);