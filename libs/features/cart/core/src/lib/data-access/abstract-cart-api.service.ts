/**
 * @file abstract-cart-api.service.ts
 * @Version 1.1.0 (Fully Documented)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-09
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-09
 * @PromptSummary "Refactor cart feature for multi-app architecture."
 * @Description
 *   Defines the abstract contract (`AbstractCartApiService`) for cart data operations.
 *   This class serves as an injection token and enforces a consistent API for
 *   fetching and modifying cart data across different application-specific
 *   implementations (e.g., Plushie Paradise, Challenger). The core business logic
 *   in CartEffects depends on this contract, not on a concrete implementation.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItem, Cart } from '@royal-code/features/cart/domain';
import { AddCartItemPayload, UpdateCartItemPayload } from '../state/cart.types';

/**
 * @class AbstractCartApiService
 * @description
 *   An abstract class that defines the mandatory methods for interacting with a
 *   shopping cart backend. It acts as a dependency injection token, allowing
 *   the application to swap different backend implementations (e.g., for different apps)
 *   without changing the core business logic that consumes this service.
 */
@Injectable({ providedIn: 'root' })
export abstract class AbstractCartApiService {
  /**
   * @method getCart
   * @description Fetches the entire cart object from the backend, including all items and totals.
   * @returns {Observable<Cart>} An observable that emits the user's complete cart.
   */
  abstract getCart(): Observable<Cart>;

  /**
   * @method addItem
   * @description Sends a request to the backend to add a new item to the cart.
   * @param {AddCartItemPayload} payload - The details of the item to add, such as product ID and quantity.
   * @returns {Observable<CartItem>} An observable that emits the newly created cart item as returned by the backend.
   */
  abstract addItem(payload: AddCartItemPayload): Observable<CartItem>;

  /**
   * @method updateItemQuantity
   * @description Sends a request to update the quantity of an existing item in the cart.
   * @param {string} itemId - The unique identifier of the cart item to update.
   * @param {UpdateCartItemPayload} payload - An object containing the new quantity.
   * @returns {Observable<CartItem>} An observable that emits the updated cart item.
   */
  abstract updateItemQuantity(itemId: string, payload: UpdateCartItemPayload): Observable<CartItem>;

  /**
   * @method removeItem
   * @description Sends a request to remove a specific item from the cart.
   * @param {string} itemId - The unique identifier of the cart item to remove.
   * @returns {Observable<void>} An observable that completes when the item has been successfully removed.
   */
  abstract removeItem(itemId: string): Observable<void>;

  /**
   * @method clearCart
   * @description Sends a request to remove all items from the cart.
   * @returns {Observable<void>} An observable that completes when the cart has been successfully cleared.
   */
  abstract clearCart(): Observable<void>;

  /**
   * @method mergeCart
   * @description
   *   Sends a request to merge an anonymous (local) cart with the user's authenticated
   *   cart on the backend, typically after a user logs in.
   * @param {readonly CartItem[]} items - The list of items from the anonymous cart to be merged.
   * @returns {Observable<Cart>} An observable that emits the final, merged cart from the backend.
   */
  abstract mergeCart(items: readonly CartItem[]): Observable<Cart>;
}
