/**
 * @file backend.dto.ts
 * @Version 1.1.0 (Crucial Type & Casing Fixes)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Defines the Data Transfer Object (DTO) contracts for the Admin Dashboard API backend.
 *              These interfaces directly mirror the expected JSON responses.
 *              Includes crucial type aliases for AdminOrderListItemDto and ReviewListItemDto
 *              to correctly represent the *mapped* domain types in the dashboard context.
 */

import { PaginatedList } from '@royal-code/shared/utils';
// FIX: Importeer de BackendAdminOrderListItemDto voor de *ruwe* API response
import { BackendAdminOrderListItemDto as RawBackendAdminOrderListItemDto } from '@royal-code/features/admin-orders/core';
// FIX: Importeer de ReviewListItemDto die al gemapt is in reviews/domain
import { ReviewListItemDto as MappedReviewListItemDto } from '@royal-code/features/reviews/domain';

// === Backend DTO's (ruw van de API) ===
export interface BackendKpiValueDto {
  readonly value: number;
  readonly changePercentage: number;
}

export interface BackendAdminDashboardStatsDto {
  readonly totalRevenue: BackendKpiValueDto;
  readonly totalSales: BackendKpiValueDto;
  readonly newCustomers: BackendKpiValueDto;
  readonly pendingReviewsCount: number;
}

export interface BackendRevenueDataPointDto {
  readonly date: string; // YYYY-MM-DD (ruwe string van backend)
  readonly revenue: number;
}

export interface BackendAdminRevenueChartDto {
  readonly period: string;
  readonly dataPoints: readonly BackendRevenueDataPointDto[];
}

export interface BackendAdminBestsellerDto {
  readonly productId: string;
  readonly productName: string;
  readonly sku: string;
  readonly unitsSold: number;
  readonly totalRevenue: number;
  readonly thumbnailUrl: string;
}

// === Type Aliases voor Frontend Gebruik in de Dashboard Context ===
// Deze aliassen vertegenwoordigen de types *na* initiële mapping door de respectievelijke services,
// en worden gebruikt in de NgRx State van de Admin Dashboard.

/**
 * @alias AdminOrderListItemDto
 * @description Vertegenwoordigt een Order List Item in de context van het dashboard,
 *              nadat het gemapt is door `AdminOrderMappingService`.
 *              Specifiek: `orderDate` is een `DateTimeInfo` object.
 */
export type AdminOrderListItemDto = RawBackendAdminOrderListItemDto & {
  orderDate: import('@royal-code/shared/base-models').DateTimeInfo; // Expliciet DateTimeInfo for orderDate
};

/**
 * @alias ReviewListItemDto
 * @description Vertegenwoordigt een Review List Item in de context van het dashboard,
 *              nadat het gemapt is door `ReviewsMappingService`.
 *              Deze komt direct overeen met `MappedReviewListItemDto` uit `reviews/domain`.
 */
export type ReviewListItemDto = MappedReviewListItemDto;