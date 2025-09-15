/**
 * @file admin-dashboard.state.ts
 * @Version 1.3.0 (Definitive Export)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Defines the state interface and initial state for the Admin Dashboard feature.
 *              Ensures `initialAdminDashboardState` is correctly exported.
 */
import { StructuredError } from '@royal-code/shared/domain';
import { AdminDashboardOrderListItem } from '@royal-code/features/admin-dashboard/domain';
import { ReviewListItemDto } from '@royal-code/features/reviews/domain';
import { DashboardStats, RevenueChartData, Bestseller } from '@royal-code/features/admin-dashboard/domain';

export interface AdminDashboardState {
  stats: DashboardStats | null;
  revenueChartData: RevenueChartData | null;
  bestsellers: readonly Bestseller[];
  recentOrders: readonly AdminDashboardOrderListItem[];
  pendingReviews: readonly ReviewListItemDto[];
  isLoadingStats: boolean;
  isLoadingChart: boolean;
  isLoadingBestsellers: boolean;
  isLoadingRecentOrders: boolean;
  isLoadingPendingReviews: boolean;
  error: StructuredError | null;
}

// FIX: Zorg ervoor dat deze variabele geëxporteerd wordt.
export const initialAdminDashboardState: AdminDashboardState = {
  stats: null,
  revenueChartData: null,
  bestsellers: [],
  recentOrders: [],
  pendingReviews: [],
  isLoadingStats: false,
  isLoadingChart: false,
  isLoadingBestsellers: false,
  isLoadingRecentOrders: false,
  isLoadingPendingReviews: false,
  error: null,
};