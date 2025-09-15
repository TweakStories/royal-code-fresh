/**
 * @file orders.effects.ts
 * @Version 2.0.0 (With Filter Logic)
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom, exhaustMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { OrderActions } from './orders.actions';
import { AbstractOrderApiService } from '../data-access/abstract-order-api.service';
import { ordersFeature } from './orders.feature';
import { NotificationService } from '@royal-code/ui/notifications';
import { CartActions } from '@royal-code/features/cart/core';
import { CreateOrderPayload, Order, OrderStatus } from '@royal-code/features/orders/domain';
import { DateTimeUtil, emptyStringToNull } from '@royal-code/shared/utils';
import { StorageService } from '@royal-code/core/storage';
import { CART_STORAGE_KEY } from 'libs/features/cart/core/src/lib/constants/cart.constants';

@Injectable()
export class OrdersEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly orderApiService = inject(AbstractOrderApiService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly storageService = inject(StorageService); 

  // Triggert de initiële load of een reload wanneer filters veranderen
    triggerLoadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.orderHistoryPageOpened, OrderActions.filtersChanged),
      withLatestFrom(this.store.select(ordersFeature.selectFilters)),
      map(([, filters]) => OrderActions.loadOrders({ page: 1, pageSize: 10, filters }))
    )
  );

  loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.loadOrders),
      switchMap(({ page, pageSize, filters }) =>
        this.orderApiService.getOrders(page, pageSize, filters).pipe(
          map(response => {
            const mappedOrders: Order[] = response.items.map((dto: any) => ({
              ...dto,
              orderDate: DateTimeUtil.createDateTimeInfo(dto.orderDate),
              status: (dto.status.charAt(0).toLowerCase() + dto.status.slice(1)) as OrderStatus,
              items: dto.items ?? [],
            }));
            return OrderActions.loadOrdersSuccess({ orders: mappedOrders, totalCount: response.totalCount });
          }),
          catchError(error => of(OrderActions.loadOrdersFailure({ error: error.message })))
        )
      )
    )
  );
  
  createOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.createOrderFromCheckout),
      exhaustMap(({ payload }) => {
        const sanitizedPayload: CreateOrderPayload = {
          shippingAddressId: emptyStringToNull(payload.shippingAddressId) as string,
          billingAddressId: emptyStringToNull(payload.billingAddressId) as string,
          shippingMethodId: emptyStringToNull(payload.shippingMethodId) as string, 
          paymentMethod: payload.paymentMethod,
          items: payload.items.map(item => ({
            productId: emptyStringToNull(item.productId) as string,
            variantId: emptyStringToNull(item.variantId),
            quantity: item.quantity,
          })),
          customerNotes: payload.customerNotes,
        };

        return this.orderApiService.createOrder(sanitizedPayload).pipe(
          map(order => {
            this.notificationService.showSuccess('Bestelling succesvol geplaatst!');
            return OrderActions.createOrderSuccess({ order });
          }),
          catchError(error => {
            this.notificationService.showError('De bestelling kon niet worden geplaatst. Probeer het opnieuw.');
            return of(OrderActions.createOrderFailure({ error: error.message }));
          })
        );
      })
    )
  );

  
  handleOrderSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.createOrderSuccess),
      tap(({ order }) => {
        this.storageService.removeItem(CART_STORAGE_KEY);
        this.router.navigate(['/checkout', 'success', order.id]);
      }),
      map(() => CartActions.clearCartSuccess())
    )
  );
}