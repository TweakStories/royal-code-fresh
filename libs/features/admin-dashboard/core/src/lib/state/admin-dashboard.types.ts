/**
 * @file admin-dashboard.types.ts
 * @Version 1.1.0 (Domain Model Aligned)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Defines the ViewModel type for the Admin Dashboard feature, now using
 *              clean domain models.
 */
import { AdminDashboardState } from './admin-dashboard.state';
// Importeer de Domain Models, niet de DTOs.
import { DashboardStats, RevenueChartData, Bestseller, AdminDashboardOrderListItem } from '@royal-code/features/admin-dashboard/domain';
import { AdminOrderListItemDto } from '../dto/backend.dto'; // AdminOrderListItemDto is hier een type alias voor BackendAdminOrderListItemDto
import { ReviewListItemDto } from '@royal-code/features/reviews/domain';
import { StructuredError } from '@royal-code/shared/domain';

export interface AdminDashboardViewModel {
  stats: DashboardStats | null;
  revenueChartData: RevenueChartData | null;
  bestsellers: readonly Bestseller[];
  recentOrders: readonly AdminDashboardOrderListItem[];
  pendingReviews: readonly ReviewListItemDto[];
  isLoading: boolean;
  error: StructuredError | null;
}
