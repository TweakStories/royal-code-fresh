/**
 * @file admin-order-api.service.ts
 * @version 4.0.0 (Removed PickPack Overload & Correct Return Type)
 * @description Concrete implementatie van AbstractAdminOrderApiService.
 *              Nu zonder de 'pickpack' overload in de getOrderById implementatie, zodat altijd een volledige DTO wordt geretourneerd.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '@royal-code/core/config';
import { Order, OrderFilters } from '@royal-code/features/orders/domain';
import {
  AbstractAdminOrderApiService,
  BackendAdminOrderDetailDto,
  BackendAdminOrderPickPackDto,
  BackendAdminLookupsDto,
  BackendAdminOrderStatsDto,
  BackendPaginatedOrderListDto,
  RefundOrderPayloadDto,
  UpdateOrderNotesPayloadDto,
  UpdateOrderStatusPayloadDto,
  CreateFulfillmentPayloadDto,
  UpdateCustomerNotesPayloadDto,
  AddOrderItemPayloadDto,
  UpdateOrderItemQuantityPayloadDto,
  BackendAdminOrderListItemDto
} from '@royal-code/features/admin-orders/core';
import { Address } from '@royal-code/shared/domain';
import { PaginatedList } from '@royal-code/shared/utils';
import { AdminOrderMappingService } from '@royal-code/features/admin-orders/core';

@Injectable({ providedIn: 'root' })
export class AdminOrderApiService extends AbstractAdminOrderApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly mapper = inject(AdminOrderMappingService);
  private readonly apiUrl = `${this.config.backendUrl}/AdminOrders`;

  // --- LEZEN ---
  override getOrders(filters: Partial<OrderFilters>): Observable<PaginatedList<Order>> {
    let params = new HttpParams();
    if (filters.page) params = params.set('PageNumber', filters.page.toString());
    if (filters.pageSize) params = params.set('PageSize', filters.pageSize.toString());
    if (filters.status && filters.status !== 'all') params = params.set('Status', filters.status);
    if (filters.userId) params = params.set('UserId', filters.userId);
    if (filters.searchTerm) params = params.set('SearchTerm', filters.searchTerm);
    if (filters.dateFrom) params = params.set('DateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('DateTo', filters.dateTo);

    return this.http.get<PaginatedList<BackendAdminOrderListItemDto>>(this.apiUrl, { params }).pipe(
      map(response => ({
        ...response,
        items: response.items.map(item => this.mapper.mapListItemToOrder(item))
      }))
    );
  }

  // << DE FIX: Implementatie van getOrderById om altijd BackendAdminOrderDetailDto te retourneren >>
  override getOrderById(orderId: string): Observable<BackendAdminOrderDetailDto>;
  override getOrderById(orderId: string, view: 'pickpack'): Observable<BackendAdminOrderPickPackDto>; // Deze overload blijft voor API compatibiliteit
  override getOrderById(orderId: string, view?: 'pickpack'): Observable<BackendAdminOrderDetailDto | BackendAdminOrderPickPackDto> {
    const opts = view ? { params: new HttpParams().set('view', view) } : {};
    return this.http.get<BackendAdminOrderDetailDto>(`${this.apiUrl}/${orderId}`, opts); // Hier forceren we de DetailDto
  }

  override getStats(dateFrom?: string, dateTo?: string): Observable<BackendAdminOrderStatsDto> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('DateFrom', dateFrom);
    if (dateTo) params = params.set('DateTo', dateTo);
    return this.http.get<BackendAdminOrderStatsDto>(`${this.apiUrl}/stats`, { params });
  }

  override getLookups(): Observable<BackendAdminLookupsDto> {
    return this.http.get<BackendAdminLookupsDto>(`${this.apiUrl}/lookups`);
  }

  // --- MUTATIES ---
  override updateStatus(orderId: string, pl: UpdateOrderStatusPayloadDto) {
    return this.http.patch<BackendAdminOrderDetailDto>(`${this.apiUrl}/${orderId}/status`, pl);
  }
  override updateInternalNotes(orderId: string, pl: UpdateOrderNotesPayloadDto) {
    return this.http.put<BackendAdminOrderDetailDto>(`${this.apiUrl}/${orderId}/notes`, pl);
  }
  override updateCustomerNotes(orderId: string, pl: UpdateCustomerNotesPayloadDto) {
    return this.http.put<BackendAdminOrderDetailDto>(`${this.apiUrl}/${orderId}/customer-notes`, pl);
  }
  override updateShippingAddress(orderId: string, pl: Address) {
    return this.http.put<BackendAdminOrderDetailDto>(`${this.apiUrl}/${orderId}/shipping-address`, pl);
  }
  override updateBillingAddress(orderId: string, pl: Address) {
    return this.http.put<BackendAdminOrderDetailDto>(`${this.apiUrl}/${orderId}/billing-address`, pl);
  }
  override updateOrderItemQuantity(orderItemId: string, pl: UpdateOrderItemQuantityPayloadDto) {
    return this.http.patch<BackendAdminOrderDetailDto>(`${this.apiUrl}/items/${orderItemId}`, pl);
  }

  // --- AANMAKEN / VERWIJDEREN ---
  override createFulfillment(orderId: string, pl: CreateFulfillmentPayloadDto) {
    return this.http.post<BackendAdminOrderDetailDto>(`${this.apiUrl}/${orderId}/fulfillments`, pl);
  }
  override addItemToOrder(orderId: string, pl: AddOrderItemPayloadDto) {
    return this.http.post<BackendAdminOrderDetailDto>(`${this.apiUrl}/${orderId}/items`, pl);
  }
  override removeOrderItem(itemId: string) {
    return this.http.delete<BackendAdminOrderDetailDto>(`${this.apiUrl}/items/${itemId}`);
  }

  // --- OVERIG ---
  override cancelOrder(orderId: string) {
    return this.http.post<BackendAdminOrderDetailDto>(`${this.apiUrl}/${orderId}/cancel`, {});
  }
  override refundOrder(orderId: string, pl: RefundOrderPayloadDto) {
    return this.http.post<BackendAdminOrderDetailDto>(`${this.apiUrl}/${orderId}/refund`, pl);
  }

  // --- DOCUMENTEN ---
  override exportOrders(filters: Partial<OrderFilters>): Observable<Blob> {
    let params = new HttpParams();
    if (filters.status && filters.status !== 'all') params = params.set('Status', filters.status);
    if (filters.userId) params = params.set('UserId', filters.userId);
    if (filters.searchTerm) params = params.set('SearchTerm', filters.searchTerm);
    if (filters.dateFrom) params = params.set('DateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('DateTo', filters.dateTo);
    return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' });
  }
  override downloadInvoice(orderId: string) {
    return this.http.get(`${this.apiUrl}/${orderId}/invoice`, { responseType: 'blob' });
  }
  override downloadPackingSlip(orderId: string) {
    return this.http.get(`${this.apiUrl}/${orderId}/packing-slip`, { responseType: 'blob' });
  }
}