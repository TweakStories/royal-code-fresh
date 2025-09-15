/**
 * @file cart.effects.ts
 * @Version 18.0.0 (Race Condition Fixed)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @description
 *   The definitive, enterprise-grade effects for the cart feature. This version
 *   removes the problematic 'ensureProductDataForCartItems$' effect, which was
 *   causing a race condition with page-level product loading. The responsibility
 *   for pre-loading product data for cart items now resides solely with the
 *   'initializeProductState' APP_INITIALIZER, which is the architecturally
*   correct location for this logic.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, withLatestFrom, concatMap, mergeMap, take, tap, filter, debounceTime, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { CartActions } from './cart.actions';
import { selectAllCartItems, cartFeature } from './cart.feature';
import { NotificationService } from '@royal-code/ui/notifications';
import { StorageService } from '@royal-code/core/storage';
import { CartItem as DomainCartItem } from '@royal-code/features/cart/domain';
import { UpdateCartItemPayload } from './cart.types';
import { AbstractCartApiService } from '../data-access/abstract-cart-api.service';
import { AuthActions, AuthFacade } from '@royal-code/store/auth';
import { LoggerService } from '@royal-code/core/core-logging';
import { CART_STORAGE_KEY } from '../constants/cart.constants';
import { ProductActions } from '@royal-code/features/products/core';
import { StructuredError } from '@royal-code/shared/domain';
import { ErrorActions } from '@royal-code/store/error';
import { emptyStringToNull } from '@royal-code/shared/utils';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class CartEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly apiService = inject(AbstractCartApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly storageService = inject(StorageService);
  private readonly authFacade = inject(AuthFacade);
  private readonly logger = inject(LoggerService);
  private readonly logPrefix = '[CartEffects]';

  // --- Auth & Init ---
  initializeOrSyncCart$ = createEffect(() => this.actions$.pipe(
    ofType(CartActions.cartInitialized),
    withLatestFrom(this.store.select(selectAllCartItems), this.authFacade.isAuthenticated$),
    switchMap(([_, items, isAuthenticated]) => {
      if (isAuthenticated) {
        this.logger.info(`${this.logPrefix} User is authenticated, syncing cart with server.`);
        // De APP_INITIALIZER heeft al gezorgd voor het laden van productdata.
        // We hoeven hier alleen de cart te syncen.
        return of(CartActions.syncWithServer());
      }
      this.logger.info(`${this.logPrefix} Anonymous user, cart initialization complete.`);
      return of({ type: '[Cart] Anonymous Initialization Complete' });
    })
  ));

  handleAuthChanges$ = createEffect(() => this.actions$.pipe(ofType(AuthActions.logoutCompleted), map(() => CartActions.clearCartSuccess())));

  mergeOnLogin$ = createEffect(() => this.actions$.pipe(
      ofType(AuthActions.loginSuccess), withLatestFrom(this.store.select(selectAllCartItems)),
      filter(([, items]) => items.length > 0 && items.some((item) => item.id.toString().startsWith('temp_'))),
      map(([, items]) => CartActions.mergeAnonymousCartSubmitted({ items: items.filter((item) => item.id.toString().startsWith('temp_')) }))
  ));

  syncOnLogin$ = createEffect(() => this.actions$.pipe(ofType(AuthActions.loginSuccess), map(() => CartActions.syncWithServer())));

  // --- API ---
  syncWithServer$ = createEffect(() => this.actions$.pipe(
      ofType(CartActions.syncWithServer), filter(() => this.authFacade.isAuthenticated()),
      exhaustMap(() => this.apiService.getCart().pipe(
          map(serverCart => CartActions.syncWithServerSuccess({ items: serverCart.items, totalVatAmount: serverCart.totalVatAmount, totalDiscountAmount: serverCart.totalDiscountAmount })),
          catchError(() => of(CartActions.syncWithServerError({ error: 'Failed to sync with server.' })))
      ))
  ));

  mergeCart$ = createEffect(() => this.actions$.pipe(
    ofType(CartActions.mergeAnonymousCartSubmitted),
    exhaustMap(({ items }) => this.apiService.mergeCart(items).pipe(
        map(mergedCart => {
          this.notificationService.showSuccess('Winkelwagen succesvol samengevoegd!');
          return CartActions.syncWithServerSuccess({
            items: mergedCart.items,
            totalVatAmount: mergedCart.totalVatAmount,
            totalDiscountAmount: mergedCart.totalDiscountAmount,
          });
        }),
        catchError(() => of(CartActions.mergeAnonymousCartFailure({ error: 'Failed to merge cart.' })))
    ))
  ));

  // --- CRUD ---
  handleItemSubmission$ = createEffect(() => this.actions$.pipe(
      ofType(CartActions.addItemSubmitted),
      concatMap(action => this.store.select(selectAllCartItems).pipe(
          take(1),
          map(currentItems => {
            const existingItem = currentItems.find(item => item.productId === action.payload.productId && (item.variantId ?? null) === (action.payload.variantId ?? null));
            
            // --- DE FIX: Voorkom de raceconditie ---
            // Als er een bestaand item is, maar het heeft nog een tijdelijk ID,
            // betekent dit dat de eerste 'add' request nog bezig is. Negeer deze dubbele actie.
            if (existingItem && existingItem.id.toString().startsWith('temp_')) {
              this.logger.warn(`${this.logPrefix} Ignoring duplicate addItem request while previous is still pending for tempId: ${existingItem.id}`);
              return { type: '[Cart] Duplicate Add Item Ignored' }; // Dispatch een no-op actie
            }
            // ------------------------------------

            if (existingItem) {
              const newQuantity = existingItem.quantity + action.payload.quantity;
              return CartActions.updateItemQuantitySubmitted({ itemId: existingItem.id, payload: { quantity: newQuantity } });
            }
            return CartActions.createNewItem({ payload: action.payload, tempId: action.tempId });
          })
      ))
  ));


    createNewItem$ = createEffect(() => this.actions$.pipe(
      ofType(CartActions.createNewItem),
      mergeMap(({ payload, tempId }) => {
        // Sanitize productId en variantId bij de bron
        const sanitizedProductId = emptyStringToNull(payload.productId);
        // <<< DE FIX: Als er geen echte variant is, stuur dan null, anders de gesanitizeerde ID >>>
        const sanitizedVariantId = payload.variantId && !payload.variantId.endsWith('-default')
                                  ? emptyStringToNull(payload.variantId)
                                  : null;
        // -----------------------------------------------------------------------------------------

        if (!this.authFacade.isAuthenticated()) {
          const localItem: DomainCartItem = {
            id: tempId,
            productId: sanitizedProductId as string,
            variantId: sanitizedVariantId, // Gebruik de gesanitizeerde/null waarde
            quantity: payload.quantity,
            productName: payload.productName,
            productImageUrl: payload.productImageUrl ?? undefined,
            pricePerItem: payload.pricePerItem,
            selectedVariants: payload.selectedVariants,
          };
          return of(
            CartActions.addItemSuccess({ item: localItem, tempId }),
            ProductActions.loadProductsByIds({ ids: [localItem.productId] })
          );
        }

        const apiPayload = {
            productId: sanitizedProductId as string,
            variantId: sanitizedVariantId, // Gebruik de gesanitizeerde/null waarde
            quantity: payload.quantity,
        };

        this.logger.info(`${this.logPrefix} Sending API payload for addItem:`, JSON.stringify(apiPayload, null, 2));

        return this.apiService.addItem(apiPayload).pipe(
          mergeMap(itemFromApi => {
            const enrichedItem: DomainCartItem = {
              ...itemFromApi,
              productName: payload.productName,
              productImageUrl: payload.productImageUrl ?? undefined,
              selectedVariants: payload.selectedVariants,
            };
            return of(CartActions.addItemSuccess({ item: enrichedItem, tempId }));
          }),
          catchError((err) => {
            // <<< DE FIX: Zorg ervoor dat de fout context serialiseerbaar is >>>
            const errorContext = {
                originalErrorMessage: err instanceof HttpErrorResponse ? err.message : String(err),
                originalErrorStatus: err instanceof HttpErrorResponse ? err.status : undefined,
                payloadSent: apiPayload,
                // Voeg hier andere relevante, serialiseerbare foutdetails toe
            };

            const structuredError: StructuredError = {
                source: '[API Cart]',
                message: 'Er is een serverfout opgetreden bij aanmaken van items. Probeer het later opnieuw.',
                severity: 'error',
                code: 'CART_ADD_ITEM_500', // Terug naar 500, want 400 is te specifiek als het een GUID-validatie issue is
                timestamp: Date.now(),
                context: errorContext, // Gebruik de serialiseerbare context
            };
            // -------------------------------------------------------------------

            this.store.dispatch(ErrorActions.reportError({ error: structuredError }));
            return of(CartActions.addItemFailure({ tempId, error: structuredError.message }));
        })
        );
      })
  ));



  removeItem$ = createEffect(() => this.actions$.pipe(
    ofType(CartActions.removeItemSubmitted),
    withLatestFrom(this.store.select(selectAllCartItems)),
    concatMap(([{ itemId }, items]) => {
      const originalItem = items.find(i => i.id === itemId) ?? null;
      if (!this.authFacade.isAuthenticated()) return of(CartActions.removeItemSuccess({ itemId }));
      return this.apiService.removeItem(itemId).pipe(
        map(() => CartActions.removeItemSuccess({ itemId })),
        catchError(() => {
          this.notificationService.showError(this.translate.instant('shoppingCart.errors.itemRemoveFailed'));
          return of(CartActions.removeItemFailure({ error: 'Failed to remove item.', originalItem }));
        })
      );
    })
  ));

  updateItem$ = createEffect(() => this.actions$.pipe(
    ofType(CartActions.updateItemQuantitySubmitted),
    concatMap(({ itemId, payload }) => {
      if (!this.authFacade.isAuthenticated()) return of(CartActions.updateItemQuantitySuccess({ itemUpdate: { id: itemId, changes: payload } }));
      return this.apiService.updateItemQuantity(itemId, payload).pipe(
        map(updatedItem => CartActions.updateItemQuantitySuccess({ itemUpdate: { id: itemId, changes: updatedItem } })),
        catchError(() => {
           this.notificationService.showError(this.translate.instant('shoppingCart.errors.quantityUpdateFailed'));
           return of(CartActions.updateItemQuantityFailure({ error: 'Failed to update quantity.', itemId }));
        })
      );
    })
  ));

  clearCart$ = createEffect(() => this.actions$.pipe(
      ofType(CartActions.clearCartSubmitted),
      withLatestFrom(this.store.select(selectAllCartItems)),
      exhaustMap(([, items]) => {
        if (!this.authFacade.isAuthenticated()) return of(CartActions.clearCartSuccess());
        return this.apiService.clearCart().pipe(
          map(() => CartActions.clearCartSuccess()),
          catchError(() => {
            this.notificationService.showError(this.translate.instant('shoppingCart.errors.clearCartFailed'));
            return of(CartActions.clearCartFailure({ error: 'Failed to clear cart.', originalItems: items }));
          })
        );
      })
  ));

  // VERWIJDERD: De problematische 'ensureProductDataForCartItems$' effect.
  // De 'initializeProductState' APP_INITIALIZER is nu de enige bron van waarheid
  // voor het pre-loaden van product data voor de winkelwagen. Dit lost de race condition op.

  // --- PERSISTENCE ---
  persistCartToStorage$ = createEffect(() => this.actions$.pipe(
      ofType(
        CartActions.addItemSuccess,
        CartActions.updateItemQuantitySuccess,
        CartActions.removeItemSuccess,
        CartActions.clearCartSuccess
      ),
      debounceTime(300),
      withLatestFrom(
        this.store.select(cartFeature.selectCartState),
        this.authFacade.isAuthenticated$
      ),
      tap(([action, state, isAuthenticated]) => {
        if (!isAuthenticated) {
          const stateToSave = { entities: state.entities, ids: state.ids };
          this.storageService.setItem(CART_STORAGE_KEY, stateToSave);
        }
      })
    ), { dispatch: false }
  );

  clearStorageOnMerge$ = createEffect(() => this.actions$.pipe(
      ofType(CartActions.mergeAnonymousCartSuccess),
      tap(() => this.storageService.removeItem(CART_STORAGE_KEY))
    ), { dispatch: false }
  );

  showNotificationOnItemAdded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.addItemSuccess),
      tap(({ item }) => {
        const message = this.translate.instant('shoppingCart.notifications.itemAddedSuccess');
        this.notificationService.showSuccess(message);
      })
    ),
    { dispatch: false }
  );
}