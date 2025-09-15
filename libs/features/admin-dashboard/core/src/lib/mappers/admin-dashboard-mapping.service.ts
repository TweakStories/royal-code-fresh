/**
 * @file admin-dashboard-mapping.service.ts
 * @Version 1.3.0 (Introduced Order to AdminDashboardListItem Mapper)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Service to map backend DTOs to frontend domain models for the Admin Dashboard.
 *              Includes a new mapper for Order to AdminDashboardOrderListItem.
 */
import { Injectable } from '@angular/core';
import {
  BackendAdminDashboardStatsDto,
  BackendAdminRevenueChartDto,
  BackendAdminBestsellerDto
} from '../dto/backend.dto';
import {
  DashboardStats,
  Kpi,
  RevenueChartData,
  Bestseller,
  RevenueDataPoint,
  AdminDashboardOrderListItem // <-- Nieuwe import
} from '@royal-code/features/admin-dashboard/domain';
import { DateTimeUtil } from '@royal-code/shared/utils';
import { Order } from '@royal-code/features/orders/domain'; // Importeer volledig Order object

@Injectable({ providedIn: 'root' })
export class AdminDashboardMappingService {

  public mapStats(dto: BackendAdminDashboardStatsDto): DashboardStats {
    const mapKpi = (kpiDto: { value: number, changePercentage: number }): Kpi => ({
      value: kpiDto.value,
      changePercentage: Math.abs(kpiDto.changePercentage),
      trendDirection: kpiDto.changePercentage > 0 ? 'up' : kpiDto.changePercentage < 0 ? 'down' : 'neutral'
    });

    return {
      totalRevenue: mapKpi(dto.totalRevenue),
      totalSales: mapKpi(dto.totalSales),
      newCustomers: mapKpi(dto.newCustomers),
      pendingReviewsCount: dto.pendingReviewsCount,
    };
  }

  public mapRevenueChart(dto: BackendAdminRevenueChartDto): RevenueChartData {
    return {
      period: dto.period,
      dataPoints: dto.dataPoints.map((dp): RevenueDataPoint => ({
        date: new Date(dp.date),
        revenue: dp.revenue,
      })),
    };
  }

  public mapBestsellers(dto: readonly BackendAdminBestsellerDto[]): readonly Bestseller[] {
    return dto as readonly Bestseller[];
  }

  /**
   * @method mapOrderToAdminDashboardListItem
   * @description Converteert een volledig `Order` domain model naar een lichtgewicht `AdminDashboardOrderListItem`.
   * @param {Order} order - Het volledige Order domain model.
   * @returns {AdminDashboardOrderListItem} Het lichtgewicht dashboard orderlijst item.
   */
  public mapOrderToAdminDashboardListItem(order: Order): AdminDashboardOrderListItem {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      grandTotal: order.grandTotal,
      currency: order.currency,
      status: order.status,
      orderDate: order.orderDate, // Dit is al DateTimeInfo
      productThumbnails: order.productThumbnails,
      paymentStatus: order.paymentDetails?.paymentStatus || 'unknown',
      hasCustomerNotes: !!order.customerNotes,
      shippingMethodName: order.shippingDetails?.methodName || 'N/A',
    };
  }
}