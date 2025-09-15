/**
 * @file abstract-wishlist-api.service.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description Defines the abstract contract for the wishlist data-access layer.
 */
import { Observable } from 'rxjs';
import { WishlistItem } from '@royal-code/features/wishlist/domain';

export interface AddWishlistItemPayload {
  productId: string;
  variantId?: string;
}

export abstract class AbstractWishlistApiService {
  abstract getWishlist(): Observable<WishlistItem[]>;
  abstract addItem(payload: AddWishlistItemPayload): Observable<WishlistItem>;
  abstract removeItem(productId: string): Observable<void>; // Verwijderen op basis van productId
}