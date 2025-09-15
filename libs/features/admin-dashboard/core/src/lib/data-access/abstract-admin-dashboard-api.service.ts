/**
 * @file abstract-admin-dashboard-api.service.ts
 * @Version 1.3.0 (getRecentOrders Return Type Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Defines the abstract contract for the Admin Dashboard API services.
 *              This serves as the Dependency Injection token and contract for
 *              specific application implementations. Uses correct DTO imports.
 *              `getRecentOrders` now returns `PaginatedList<AdminDashboardOrderListItem>`.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedList } from '@royal-code/shared/utils';
// FIX: Importeer AdminDashboardOrderListItem uit onze domain library
import { AdminDashboardOrderListItem } from '@royal-code/features/admin-dashboard/domain';
// Importeer de Backend DTO's direct.
import {
  BackendAdminDashboardStatsDto,
  BackendAdminRevenueChartDto,
  BackendAdminBestsellerDto,
  ReviewListItemDto // <-- Gebruik de alias uit onze eigen dto folder
} from '../dto/backend.dto'; // <-- Correcte import van DTO's/aliassen uit dezelfde core/dto
import { ReviewFilters } from '@royal-code/features/reviews/domain'; // <-- ReviewFilters komt uit reviews/domain

/**
 * @abstract
 * @class AbstractAdminDashboardApiService
 * @description
 *   Defines the mandatory methods for fetching admin dashboard-specific data
 *   from the backend. This class acts as a dependency injection token, allowing
 *   different backend implementations to be swapped without changing the core
 *   logic that consumes this service.
 */
@Injectable({ providedIn: 'root' })
export abstract class AbstractAdminDashboardApiService {
  /**
   * @method getDashboardStats
   * @description Fetches key performance indicators (KPIs) and their comparison percentages.
   * @returns {Observable<BackendAdminDashboardStatsDto>} An observable that emits the dashboard statistics.
   */
  abstract getDashboardStats(): Observable<BackendAdminDashboardStatsDto>;

  /**
   * @method getRevenueChartData
   * @description Fetches time-series data for the revenue chart.
   * @param {number} [days=30] - The number of days back to retrieve data for.
   * @returns {Observable<BackendAdminRevenueChartDto>} An observable that emits the revenue chart data.
   */
  abstract getRevenueChartData(days?: number): Observable<BackendAdminRevenueChartDto>;

  /**
   * @method getBestsellers
   * @description Fetches a list of best-selling products.
   * @param {number} [limit=5] - The maximum number of bestsellers to return.
   * @returns {Observable<readonly BackendAdminBestsellerDto[]>} An observable that emits an array of best-selling product DTOs.
   */
  abstract getBestsellers(limit?: number): Observable<readonly BackendAdminBestsellerDto[]>;

  /**
   * @method getRecentOrders
   * @description Fetches a paginated list of recent orders for display on the dashboard.
   *              Delegates to AdminOrdersApiService.
   * @param {number} pageNumber - The page number (e.g., 1).
   * @param {number} pageSize - The number of items per page.
   * @param {string} sortBy - Field to sort by (e.g., 'orderDate').
   * @param {string} sortDirection - Sort direction ('asc' or 'desc').
   * @returns {Observable<PaginatedList<AdminDashboardOrderListItem>>} Observable emitting a paginated list of recent orders.
   */
  abstract getRecentOrders(pageNumber: number, pageSize: number, sortBy: string, sortDirection: string): Observable<PaginatedList<AdminDashboardOrderListItem>>;

  /**
   * @method getPendingReviews
   * @description Fetches a paginated list of reviews with 'Pending' status for moderation.
   *              Delegates to ReviewsApiService.
   * @param {number} pageNumber - The page number (e.g., 1).
   * @param {number} pageSize - The number of items per page.
   * @param {string} sortBy - Field to sort by (e.g., 'createdAt').
   * @param {string} status - Status to filter by (e.g., 'pending').
   * @returns {Observable<PaginatedList<ReviewListItemDto>>} Observable emitting a paginated list of pending reviews.
   */
  abstract getPendingReviews(pageNumber: number, pageSize: number, sortBy: string, status: string): Observable<PaginatedList<ReviewListItemDto>>;
}