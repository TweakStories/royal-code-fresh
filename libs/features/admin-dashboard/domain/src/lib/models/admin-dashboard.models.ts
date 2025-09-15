/**
 * @file admin-dashboard.models.ts
 * @Version 1.2.0 (Introduced AdminDashboardOrderListItem)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Defines the frontend domain models for the Admin Dashboard feature.
 *              These models are clean, UI-focused representations of the backend data.
 *              Introduces a specific model for order list items on the dashboard.
 */
import type { ReviewListItemDto } from '@royal-code/features/reviews/domain'; // Importeer als type
import { DateTimeInfo } from '@royal-code/shared/base-models'; // Importeer DateTimeInfo

// Specifieke Domain Model voor een Order ListItem op het Dashboard
export interface AdminDashboardOrderListItem {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerName: string;
  readonly grandTotal: number;
  readonly currency: string;
  readonly status: string; // Hier is het nog een string, de pipe converteert het later
  readonly orderDate: DateTimeInfo; // Gemapt Date
  readonly productThumbnails: readonly string[];
  readonly paymentStatus: string;
  readonly hasCustomerNotes: boolean;
  readonly shippingMethodName: string; // Specifiek veld voor de UI
}


export interface Kpi {
  value: number; // <<< AANGEPAST
  changePercentage: number; // <<< AANGEPAST
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface DashboardStats {
  totalRevenue: Kpi;
  totalSales: Kpi;
  newCustomers: Kpi;
  pendingReviewsCount: number;
}

export interface RevenueDataPoint {
  date: Date; // Gebruik een echt Date object in het domain model
  revenue: number;
}

export interface RevenueChartData {
  period: string;
  dataPoints: readonly RevenueDataPoint[];
}

export interface Bestseller {
  productId: string;
  productName: string;
  sku: string;
  unitsSold: number;
  totalRevenue: number;
  thumbnailUrl: string;
}

// FIX: Exporteer als type om TS1205 te vermijden.
export type { ReviewListItemDto };