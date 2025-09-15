/**
 * @file plushie-checkout-api.service.ts
 * @Version 3.0.0 (Synchronized with correct Domain Models)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Data-access service voor checkout, nu gesynchroniseerd met de correcte
 *   'ShippingMethodFilter' die de universele 'Address' interface gebruikt.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { SubmitOrderPayload, AbstractCheckoutApiService } from '@royal-code/features/checkout/core';
import { Order } from '@royal-code/features/orders/domain';
import { ShippingMethod, ShippingMethodFilter } from '@royal-code/features/checkout/domain';

@Injectable({ providedIn: 'root' })
export class PlushieCheckoutApiService extends AbstractCheckoutApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/Checkout`;

  getShippingMethods(filters: ShippingMethodFilter): Observable<ShippingMethod[]> {
    if (filters.shippingAddressId) {
      const params = new HttpParams().set('shippingAddressId', filters.shippingAddressId);
      return this.http.get<ShippingMethod[]>(`${this.apiUrl}/shipping-methods`, { params });
    } else if (filters.address) {
      return this.http.post<ShippingMethod[]>(`${this.apiUrl}/shipping-methods/calculate`, filters.address);
    }
    return of([]);
  }

  submitOrder(payload: SubmitOrderPayload): Observable<Order> {
    return this.http.post<Order>(`${this.config.backendUrl}/orders`, payload);
  }
}