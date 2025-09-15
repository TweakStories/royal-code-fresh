/**
 * @file abstract-checkout-api.service.ts
 * @Version 2.0.0 (Shipping Methods Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   Defines the abstract base class `AbstractCheckoutApiService`.
 */
import { Observable } from 'rxjs';
import { SubmitOrderPayload } from '../state/checkout.types';
import { Order } from '@royal-code/features/orders/domain';
import { ShippingMethod, ShippingMethodFilter } from '@royal-code/features/checkout/domain';

/**
 * @abstract
 * @class AbstractCheckoutApiService
 * @description
 *   Serves as the dependency-inversion token and contract for checkout API services.
 *   The core `CheckoutEffects` will inject this abstract class, and the specific
 *   application (e.g., 'plushie-paradise', 'challenger') will provide a concrete
 *   implementation.
 *
 * @example
 * // In a specific app's app.config.ts:
 * providers: [
 *   { provide: AbstractCheckoutApiService, useClass: MySpecificCheckoutApiService }
 * ]
 */
export abstract class AbstractCheckoutApiService {
  /**
   * @abstract
   * @method getShippingMethods
   * @description
   *   Contract for fetching available shipping methods.
   * @param {ShippingMethodFilter} filters - The filters to apply, primarily the shipping address ID.
   * @returns {Observable<ShippingMethod[]>} An observable that emits a list of available shipping methods.
   */
  abstract getShippingMethods(filters: ShippingMethodFilter): Observable<ShippingMethod[]>;

  /**
   * @abstract
   * @method submitOrder
   * @description
   *   Contract for submitting the complete order details to the backend.
   *   Implementations of this method should handle the HTTP POST request to the
   *   appropriate order-creation endpoint for their specific backend.
   *
   * @param {SubmitOrderPayload} payload - The complete order data, including cart items,
   *                                       shipping address, and payment method details.
   * @returns {Observable<Order>} An observable that emits the newly created `Order` object
   *                              as returned by the backend upon success.
   */

  abstract submitOrder(payload: SubmitOrderPayload): Observable<Order>;
}