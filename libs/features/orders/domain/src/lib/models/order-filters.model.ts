/**
 * @file order-filters.model.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-07-19
 * @Description Defines the interface for filtering order queries.
 */
import { OrderStatus } from "./order.model";

export interface OrderFilters {
  searchTerm?: string;
  status?: OrderStatus | 'unshipped' | 'all';
  userId?: string;
  dateFrom?: string; // ISO string
  dateTo?: string; // ISO string
  page?: number;
  pageSize?: number;
  // FIX: Zorg ervoor dat deze properties hier staan
  sortBy?: string;
  sortDirection?: 'asc' | 'desc' | string;
}