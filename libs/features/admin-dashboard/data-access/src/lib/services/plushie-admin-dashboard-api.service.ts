/**
 * @file plushie-admin-dashboard-api.service.ts
 * @Version 1.9.0 (Definitive - All Type, Import & Mapping Issues Resolved)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Definitive concrete implementation for the Admin Dashboard API.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import {
  AbstractAdminDashboardApiService,
  BackendAdminDashboardStatsDto,
  BackendAdminRevenueChartDto,
  BackendAdminBestsellerDto,
  AdminDashboardMappingService
} from '@royal-code/features/admin-dashboard/core';
import { PaginatedList } from '@royal-code/shared/utils';

// FIX: Importeer OrderFilters en Order direct vanuit de bron in 'orders/domain'
import { OrderFilters, Order } from '@royal-code/features/orders/domain';
import { AbstractAdminOrderApiService } from '@royal-code/features/admin-orders/core';
import { ReviewListItemDto, ReviewFilters, ReviewStatus, ReviewTargetEntityType } from '@royal-code/features/reviews/domain';
import { ReviewsMappingService, AbstractReviewsApiService } from '@royal-code/features/reviews/core';
import { AdminDashboardOrderListItem } from '@royal-code/features/admin-dashboard/domain';

@Injectable({ providedIn: 'root' })
export class PlushieAdminDashboardApiService implements AbstractAdminDashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly adminDashboardApiUrl = `${this.config.backendUrl}/AdminDashboard`;
  private readonly adminOrdersApiService = inject(AbstractAdminOrderApiService);
  private readonly reviewsApiService = inject(AbstractReviewsApiService);
  private readonly dashboardMapper = inject(AdminDashboardMappingService);

  getDashboardStats(): Observable<BackendAdminDashboardStatsDto> {
    return this.http.get<BackendAdminDashboardStatsDto>(`${this.adminDashboardApiUrl}/stats`);
  }

  getRevenueChartData(days?: number): Observable<BackendAdminRevenueChartDto> {
    let params = new HttpParams();
    if (days !== undefined) {
      params = params.set('days', days.toString());
    }
    return this.http.get<BackendAdminRevenueChartDto>(`${this.adminDashboardApiUrl}/revenue-chart`, { params });
  }

  getBestsellers(limit?: number): Observable<readonly BackendAdminBestsellerDto[]> {
    let params = new HttpParams();
    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<readonly BackendAdminBestsellerDto[]>(`${this.adminDashboardApiUrl}/bestsellers`, { params });
  }

  getRecentOrders(pageNumber: number, pageSize: number, sortBy: string, sortDirection: string): Observable<PaginatedList<AdminDashboardOrderListItem>> {
    const filters: Partial<OrderFilters> = {
      page: pageNumber,
      pageSize: pageSize,
      sortBy: sortBy, // FIX: Dit zou nu moeten werken met de correcte import
      sortDirection: sortDirection,
    };

    return this.adminOrdersApiService.getOrders(filters).pipe(
      map(paginatedOrderList => ({
        ...paginatedOrderList,
        items: paginatedOrderList.items.map(order => this.dashboardMapper.mapOrderToAdminDashboardListItem(order as Order)) // FIX: Cast 'order' naar 'Order'
      }))
    );
  }

  getPendingReviews(pageNumber: number, pageSize: number, sortBy: string, status: string): Observable<PaginatedList<ReviewListItemDto>> {
    const filters: ReviewFilters = {
      pageNumber: pageNumber,
      pageSize: pageSize,
      sortBy: sortBy as any,
      status: status as ReviewStatus,
    };
    return this.reviewsApiService.getMyReviews(filters);
  }
}