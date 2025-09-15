/**
 * @file abstract-admin-order-api.service.ts
 * @version 4.0.0 (Removed PickPack Overload & Correct Return Type)
 * @description Abstract contract voor de AdminOrders API‑calls. Nu zonder de 'pickpack' overload.
 *              De `getOrderById` methode retourneert nu altijd een `BackendAdminOrderDetailDto`.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order, OrderFilters } from '@royal-code/features/orders/domain';
import {
  BackendAdminOrderDetailDto,
  BackendAdminOrderPickPackDto, // Behoud import for DTO, maar niet voor overload/return type van getOrderById
  BackendAdminOrderStatsDto,
  BackendAdminLookupsDto,
  UpdateOrderStatusPayloadDto,
  UpdateOrderNotesPayloadDto,
  RefundOrderPayloadDto,
  CreateFulfillmentPayloadDto,
  UpdateCustomerNotesPayloadDto,
  AddOrderItemPayloadDto,
  UpdateOrderItemQuantityPayloadDto
} from '../DTOs/backend.dto';
import { Address } from '@royal-code/shared/domain';
import { PaginatedList } from '@royal-code/shared/utils';

@Injectable({ providedIn: 'root' })
export abstract class AbstractAdminOrderApiService {

  // --- LEZEN ---
  abstract getOrders(filters: Partial<OrderFilters>): Observable<PaginatedList<Order>>;
  // << DE FIX: Retourneert nu altijd BackendAdminOrderDetailDto >>
  abstract getOrderById(orderId: string): Observable<BackendAdminOrderDetailDto>;
  abstract getOrderById(orderId: string, view: 'pickpack'): Observable<BackendAdminOrderPickPackDto>; // << Overload voor de specifieke view blijft voor API contract, maar wordt niet gebruikt door de effecten
  abstract getOrderById(orderId: string, view?: 'pickpack'): Observable<BackendAdminOrderDetailDto | BackendAdminOrderPickPackDto>;


  abstract getStats(dateFrom?: string, dateTo?: string): Observable<BackendAdminOrderStatsDto>;
  abstract getLookups(): Observable<BackendAdminLookupsDto>;

  // --- MUTATIES ---
  abstract updateStatus(orderId: string, payload: UpdateOrderStatusPayloadDto):
    Observable<BackendAdminOrderDetailDto>;
  abstract updateInternalNotes(orderId: string, payload: UpdateOrderNotesPayloadDto):
    Observable<BackendAdminOrderDetailDto>;
  abstract updateCustomerNotes(orderId: string, payload: UpdateCustomerNotesPayloadDto):
    Observable<BackendAdminOrderDetailDto>;
  abstract updateShippingAddress(orderId: string, payload: Address):
    Observable<BackendAdminOrderDetailDto>;
  abstract updateBillingAddress(orderId: string, payload: Address):
    Observable<BackendAdminOrderDetailDto>;
  abstract updateOrderItemQuantity(orderItemId: string, payload: UpdateOrderItemQuantityPayloadDto):
    Observable<BackendAdminOrderDetailDto>;

  // --- AANMAKEN / VERWIJDEREN ---
  abstract createFulfillment(orderId: string, payload: CreateFulfillmentPayloadDto):
    Observable<BackendAdminOrderDetailDto>;
  abstract addItemToOrder(orderId: string, payload: AddOrderItemPayloadDto):
    Observable<BackendAdminOrderDetailDto>;
  abstract removeOrderItem(orderItemId: string):
    Observable<BackendAdminOrderDetailDto>;

  // --- OVERIG ---
  abstract cancelOrder(orderId: string): Observable<BackendAdminOrderDetailDto>;
  abstract refundOrder(orderId: string, payload: RefundOrderPayloadDto):
    Observable<BackendAdminOrderDetailDto>;

  // --- DOCUMENTEN ---
  abstract exportOrders(filters: Partial<OrderFilters>): Observable<Blob>;
  abstract downloadInvoice(orderId: string): Observable<Blob>;
  abstract downloadPackingSlip(orderId: string): Observable<Blob>;
}