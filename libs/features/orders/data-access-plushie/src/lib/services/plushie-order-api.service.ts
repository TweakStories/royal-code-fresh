/**
 * @file plushie-order-api.service.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-19
 * @Description Concrete implementation of the Order API service for Plushie Paradise.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderPayload, Order, OrderFilters, OrderSummary } from '@royal-code/features/orders/domain';
import { APP_CONFIG } from '@royal-code/core/config';
import { AbstractOrderApiService } from '@royal-code/features/orders/core';
import { PaginatedList } from '@royal-code/shared/utils';

@Injectable({ providedIn: 'root' })
export class PlushieOrderApiService implements AbstractOrderApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/Orders`;

  getOrders(page: number, pageSize: number, filters?: Partial<OrderFilters>): Observable<PaginatedList<OrderSummary>> {
    let params = new HttpParams()
      .set('PageNumber', page.toString())
      .set('PageSize', pageSize.toString());

    if (filters?.status) {
      params = params.set('Status', filters.status);
    }
    if (filters?.searchTerm) {
      params = params.set('SearchTerm', filters.searchTerm);
    }
    
    return this.http.get<PaginatedList<OrderSummary>>(this.apiUrl, { params });
  }

  getOrderById(orderId: string): Observable<Order> {
    // We gaan uit van de "ideale" API die we hebben gespecificeerd
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, payload);
  }

}