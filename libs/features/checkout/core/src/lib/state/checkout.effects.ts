/**
 * @file checkout.effects.ts
 * @Version 6.1.0 (Corrected Imports & Return Types)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Definitive implementation of checkout effects, with corrected RxJS imports
 *   and type-safe action returns.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
import { of } from 'rxjs';
import { map, withLatestFrom, tap, concatMap, switchMap, catchError } from 'rxjs/operators';
import { CheckoutActions } from './checkout.actions';
import { checkoutFeature } from './checkout.feature';
import { selectAllCartItems } from '@royal-code/features/cart/core';
import { NotificationService } from '@royal-code/ui/notifications';
import { StorageService } from '@royal-code/core/storage';
import { UserActions } from '@royal-code/store/user';
import { OrderActions } from '@royal-code/features/orders/core';
import { CreateOrderPayload } from '@royal-code/features/orders/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { AbstractCheckoutApiService } from '../data-access/abstract-checkout-api.service';

@Injectable()
export class CheckoutEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly notificationService = inject(NotificationService);
  private readonly storageService = inject(StorageService);
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(AbstractCheckoutApiService);

  loadShippingMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CheckoutActions.loadShippingMethods),
      switchMap(({ filters }) =>
        this.apiService.getShippingMethods(filters).pipe(
          map(methods => CheckoutActions.loadShippingMethodsSuccess({ methods })),
          catchError((error: Error) => {
            this.logger.error('[CheckoutEffects] Failed to load shipping methods', error);
            return of(CheckoutActions.loadShippingMethodsFailure({ error: 'Failed to load shipping methods.' }));
          })
        )
      )
    )
  );

  submitOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CheckoutActions.orderSubmitted),
      withLatestFrom(
        this.store.select(checkoutFeature.selectCheckoutViewModel),
        this.store.select(selectAllCartItems)
      ),
      map(([, checkout, cartItems]): Action => { 
        if (!checkout.shippingAddress?.id || !checkout.selectedShippingMethodId || !checkout.paymentMethodId || cartItems.length === 0) {
          this.notificationService.showError('Onvolledige bestelgegevens. Kan niet doorgaan.');
          return ({ type: '[Checkout] Submit Order Aborted - Incomplete Data' });
        }

        const payload: CreateOrderPayload = {
          shippingAddressId: checkout.shippingAddress.id,
          billingAddressId: checkout.shippingAddress.id,
          shippingMethodId: checkout.selectedShippingMethodId, 
          paymentMethod: checkout.paymentMethodId,
          items: cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          customerNotes: '',
        };
        return OrderActions.createOrderFromCheckout({ payload });
      })
    )
  );

handleShippingStepSubmitted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CheckoutActions.shippingStepSubmitted),
      concatMap(({ address, saveAddress, shouldNavigate }) => {
        const actionsToDispatch: Action[] = [
          CheckoutActions.shippingAddressSet({ address })
        ];

        if (saveAddress) {
          const tempId = `temp-addr-${Date.now()}`;
          this.store.dispatch(UserActions.createAddressSubmitted({ payload: address, tempId }));
        }

        if (shouldNavigate) {
          actionsToDispatch.push(CheckoutActions.goToStep({ step: 'payment' }));
        }
        
        return of(...actionsToDispatch);
      })
    )
  );


  private readonly CHECKOUT_STORAGE_KEY = 'royal-code-checkout';

  persistStateToSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        CheckoutActions.shippingAddressSet,
        CheckoutActions.paymentMethodSet,
        CheckoutActions.goToStep
      ),
      withLatestFrom(this.store.select(checkoutFeature.selectCheckoutState)),
      tap(([, state]) => {
        this.storageService.setItem(this.CHECKOUT_STORAGE_KEY, state, 'session');
      })
    ),
    { dispatch: false }
  );

  clearStateOnSuccessOrReset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        OrderActions.createOrderSuccess,
        CheckoutActions.flowReset
      ),
      tap(() => {
        this.storageService.removeItem(this.CHECKOUT_STORAGE_KEY, 'session');
      })
    ),
    { dispatch: false }
  );
}