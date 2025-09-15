/**
 * @file wishlist-mapping.service.ts
 * @Version 2.0.0 (Correctly Maps StockStatus)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description Service for mapping backend Wishlist DTOs to frontend domain models, with correct StockStatus handling.
 */
import { Injectable, inject } from '@angular/core';
import { DateTimeUtil } from '@royal-code/shared/utils';
import { WishlistItem, WishlistItemVariantAttribute } from '@royal-code/features/wishlist/domain';
import { BackendWishlistItemDto } from '../DTO/backend.types';

@Injectable({ providedIn: 'root' })
export class WishlistMappingService {

  public mapBackendWishlistItemToDomain(dto: BackendWishlistItemDto): WishlistItem {
    const mappedVariantAttributes: WishlistItemVariantAttribute[] | undefined = dto.variantAttributes?.map(attrDto => ({
      attributeType: attrDto.attributeType,
      displayName: attrDto.displayName,
      value: attrDto.value,
      colorHex: attrDto.colorHex ?? null, // Nu `null` acceptabel
    }));

    return {
      id: dto.id,
      productId: dto.productId,
      variantId: dto.variantId ?? null, // Nu `null` acceptabel
      addedAt: DateTimeUtil.createDateTimeInfo(dto.addedAt),
      productName: dto.productName,
      productImageUrl: dto.productImageUrl ?? null, // Nu `null` acceptabel
      price: dto.price,
      originalPrice: dto.originalPrice ?? null, // Nu `null` acceptabel
      currency: dto.currency,
      stockStatus: dto.stockStatus,
      inStock: dto.inStock,
      variantAttributes: mappedVariantAttributes,
    };
  }

  public mapBackendWishlistItemsToDomain(dtos: BackendWishlistItemDto[]): WishlistItem[] {
    return dtos.map(dto => this.mapBackendWishlistItemToDomain(dto));
  }
}