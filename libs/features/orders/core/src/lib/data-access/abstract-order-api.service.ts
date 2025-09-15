/**
 * @file abstract-order-api.service.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-19
 * @Description Defines the abstract contract for the order data-access layer.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateOrderPayload, Order, OrderFilters, OrderSummary } from '@royal-code/features/orders/domain';
import { PaginatedList } from '@royal-code/shared/utils';

@Injectable({ providedIn: 'root' })
export abstract class AbstractOrderApiService {
  /**
   * Fetches a paginated list of order summaries for the current user.
   */
  abstract getOrders(page: number, pageSize: number, filters?: Partial<OrderFilters>): Observable<PaginatedList<OrderSummary>>;

  /**
   * Fetches the full details of a single order by its ID.
   */
  abstract getOrderById(orderId: string): Observable<Order>;

  /**
   * Submits a new order to the backend.
   */
  abstract createOrder(payload: CreateOrderPayload): Observable<Order>;

}