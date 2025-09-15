/**
 * @file plushie-cart-api.service.ts
 * @Version 2.0.0 (Correctly Implements AbstractCartApiService)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Correcte implementatie van de AbstractCartApiService voor de "Plushie Paradise"
 *   applicatie. Deze service communiceert met de Plushie Paradise-specifieke
 *   backend endpoints voor alle winkelwagen-gerelateerde operaties.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem, Cart } from '@royal-code/features/cart/domain';
import { APP_CONFIG } from '@royal-code/core/config';
import { AddCartItemPayload, UpdateCartItemPayload } from '@royal-code/features/cart/core';
import { AbstractCartApiService } from '@royal-code/features/cart/core'; // <<< Correcte import

@Injectable({ providedIn: 'root' })
export class PlushieCartApiService implements AbstractCartApiService { // <<< Correcte implementatie
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/Cart`; // Base URL for the Plushie Paradise cart API

  /**
   * @method getCart
   * @description Implements the `getCart` contract by performing a GET request to the main cart endpoint.
   * @returns {Observable<Cart>} An observable emitting the user's cart.
   */
  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  /**
   * @method addItem
   * @description Implements the `addItem` contract by performing a POST request to the items endpoint.
   * @param {AddCartItemPayload} payload - The details of the item to add.
   * @returns {Observable<CartItem>} An observable emitting the newly created cart item.
   */
  addItem(payload: AddCartItemPayload): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.apiUrl}/items`, payload);
  }

  /**
   * @method updateItemQuantity
   * @description Implements the `updateItemQuantity` contract by performing a PATCH request to a specific item's endpoint.
   * @param {string} itemId - The ID of the item to update.
   * @param {UpdateCartItemPayload} payload - The new quantity.
   * @returns {Observable<CartItem>} An observable emitting the updated cart item.
   */
  updateItemQuantity(itemId: string, payload: UpdateCartItemPayload): Observable<CartItem> {
    return this.http.patch<CartItem>(`${this.apiUrl}/items/${itemId}`, payload);
  }

  /**
   * @method removeItem
   * @description Implements the `removeItem` contract by performing a DELETE request to a specific item's endpoint.
   * @param {string} itemId - The ID of the item to remove.
   * @returns {Observable<void>} An observable that completes upon successful removal.
   */
  removeItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${itemId}`);
  }

  /**
   * @method clearCart
   * @description Implements the `clearCart` contract by performing a DELETE request on the main cart endpoint.
   * @returns {Observable<void>} An observable that completes upon successful clearing.
   */
  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }

  /**
   * @method mergeCart
   * @description Implements the `mergeCart` contract by performing a POST request to the merge endpoint.
   * @param {readonly CartItem[]} items - The items from the anonymous cart.
   * @returns {Observable<Cart>} An observable emitting the merged cart.
   */
  mergeCart(items: readonly CartItem[]): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/merge`, { items });
  }
}