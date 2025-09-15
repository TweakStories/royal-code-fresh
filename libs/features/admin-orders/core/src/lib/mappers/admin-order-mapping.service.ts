/**
 * @file admin-order-mapping.service.ts
 * @version 4.0.0 (Removed PickPack Mapper)
 * @description Mapper die nu alle inkomende orderstatussen naar camelCase converteert
 *              om inconsistenties met de backend op te lossen en consistentie in de frontend te garanderen.
 *              De 'pickpack' mapper is verwijderd, aangezien deze niet meer wordt gebruikt.
 */
import { Injectable } from '@angular/core';
import { DateTimeUtil } from '@royal-code/shared/utils';
import {
  BackendAdminOrderDetailDto,
  // BackendAdminOrderPickPackDto, // Removed
  BackendAdminOrderListItemDto,
  BackendOrderItemDto,
  BackendInternalNoteDto,
  BackendFulfillmentDto,
  BackendHistoryEventDto,
  BackendRefundDto
} from '../DTOs/backend.dto';
import {
  Order,
  OrderItem,
  OrderStatus,
  InternalNote,
  Fulfillment,
  HistoryEvent,
  Refund
} from '@royal-code/features/orders/domain';
import { Address } from '@royal-code/shared/domain';
import { ProductType } from '@royal-code/features/products/domain';

@Injectable({ providedIn: 'root' })
export class AdminOrderMappingService {

  /**
   * Converteert een string naar camelCase.
   * Wordt gebruikt om inconsistente casing van de backend (PascalCase/camelCase) te normaliseren.
   */
  private toCamelCase(str: string): string {
    if (!str) return '';
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

    /* -- LIST -- */
    // FIX: Retourneer MappedAdminOrderListItemDto
  mapListItemToOrder(dto: BackendAdminOrderListItemDto): Order {
    return {
      id: dto.id,
      orderNumber: dto.orderNumber,
      orderDate: DateTimeUtil.createDateTimeInfo(dto.orderDate),
      status: this.toCamelCase(dto.status) as OrderStatus,
      userId: '', // Niet in DTO, default naar leeg
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      totalItems: dto.totalItems,
      grandTotal: dto.grandTotal,
      currency: dto.currency,
      items: [], // Lijstitems hebben geen gedetailleerde items, dus een lege array
      productThumbnails: dto.productThumbnails,
      // Vul de rest van de vereiste Order-properties met defaults/placeholders
      subTotal: dto.grandTotal, // Beste gok
      shippingCost: 0,
      discountAmount: 0,
      taxAmount: 0,
      shippingAddress: { countryCode: dto.shippingSummary.countryCode } as Address,
      billingAddress: {} as Address,
      fulfillments: [],
      history: [],
      internalNotes: [],
      refunds: [],
      createdAt: DateTimeUtil.createDateTimeInfo(dto.orderDate),
      lastModified: DateTimeUtil.createDateTimeInfo(dto.orderDate),
    };
  }


  /* -- DETAIL -- */
  mapDetailDtoToOrder(dto: BackendAdminOrderDetailDto): Order {
    return {
      id: dto.id,
      orderNumber: dto.orderNumber,
      orderDate:   DateTimeUtil.createDateTimeInfo(dto.orderDate),
      status:      this.toCamelCase(dto.status) as OrderStatus,
      userId:      dto.customer.userId,
      customerName:dto.customer.name,
      customerEmail:dto.customer.email,
      subTotal: dto.financialSummary.subTotal,
      shippingCost:dto.financialSummary.shippingCost,
      taxAmount: dto.financialSummary.taxAmount,
      discountAmount:dto.financialSummary.discountAmount,
      grandTotal: dto.financialSummary.grandTotal,
      currency: dto.financialSummary.currency,
      shippingAddress: dto.shippingAddress,
      billingAddress:  dto.billingAddress,
      paymentDetails:  dto.paymentDetails,
      items: dto.items.map(this.mapItem),
      totalItems: dto.items.reduce((s,i)=>s+i.quantity,0),
      productThumbnails: dto.items.map(i=>i.productImageUrl).filter(Boolean) as string[],
      customerNotes: dto.customerNotes ?? undefined,
      internalNotes: dto.internalNotes.map(this.mapNote),
      fulfillments:  dto.fulfillments.map(this.mapFulfillment),
      history:       dto.history.map(this.mapHistory),
      refunds:       dto.refunds.map(this.mapRefund),
      createdAt:    DateTimeUtil.createDateTimeInfo(dto.orderDate),
      lastModified: DateTimeUtil.createDateTimeInfo(dto.orderDate)
    };
  }

  // Removed mapPickPackDtoToOrder

  /* -- helpers -- */
private mapItem = (d: BackendOrderItemDto): OrderItem => ({
      id: d.id,
      productId: d.productId,
      productVariantId: d.productVariantId,
      productName: d.productName,
      sku: d.sku,
      productType: d.productType ?? 'physical',
      quantity: d.quantity,
      pricePerItem: d.pricePerItem,
      lineTotal: d.lineTotal,
      taxAmount: d.taxAmount,
      discountAmount: d.discountAmount,
      variantInfo: d.variantInfo,
      productImageUrl: d.productImageUrl,
  });


  private mapNote = (d: BackendInternalNoteDto): InternalNote => ({ ...d, createdAt: DateTimeUtil.createDateTimeInfo(d.createdAt) });
  private mapFulfillment = (d: BackendFulfillmentDto): Fulfillment => ({
    ...d,
    createdAt: DateTimeUtil.createDateTimeInfo(d.createdAt),
    shippedDate: d.shippedDate ? DateTimeUtil.createDateTimeInfo(d.shippedDate) : null,
    estimatedDeliveryDate: d.estimatedDeliveryDate ? DateTimeUtil.createDateTimeInfo(d.estimatedDeliveryDate) : null
  });
  private mapHistory = (d: BackendHistoryEventDto): HistoryEvent =>
    ({ ...d, timestamp: DateTimeUtil.createDateTimeInfo(d.timestamp) });
  private mapRefund = (d: BackendRefundDto): Refund =>
    ({ ...d, refundedAt: DateTimeUtil.createDateTimeInfo(d.refundedAt) });
}