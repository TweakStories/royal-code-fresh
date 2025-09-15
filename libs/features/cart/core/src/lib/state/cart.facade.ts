/**
 * @file cart.facade.ts
 * @Version 9.1.0 (Corrected with Dual API - Signals & Observables)
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs'; // <-- BELANGRIJKE IMPORT
import { map } from 'rxjs/operators'; // <-- BELANGRIJKE IMPORT
import { CartActions } from './cart.actions';
import { AddCartItemPayload, CartViewModel } from './cart.types';
import { selectCartViewModel } from './cart.feature';

@Injectable({ providedIn: 'root' })
export class CartFacade {
  private readonly store = inject(Store);

  private createInitialViewModel(): CartViewModel {
    return {
      items: [], isLoading: true, isSubmitting: false, error: null, isEmpty: true,
      optimisticItemIds: new Set<string>(), totalItemCount: 0, uniqueItemCount: 0,
      subTotal: 0, isEligibleForFreeShipping: false, shippingCost: 4.95,
      totalWithShipping: 0, totalVatAmount: 0, totalDiscountAmount: 0,
    };
  }

  // --- Primaire ViewModel (brondata) ---
  private readonly viewModel$: Observable<CartViewModel> = this.store.select(selectCartViewModel);
  private readonly viewModelSignal: Signal<CartViewModel> = toSignal(
    this.viewModel$,
    { initialValue: this.createInitialViewModel() }
  );

  // --- Public API: Signals (voor UI) ---
  readonly viewModel = computed(() => this.viewModelSignal());
  readonly isLoading = computed(() => this.viewModel().isLoading);
  readonly isSubmitting = computed(() => this.viewModel().isSubmitting);
  readonly isEmpty = computed(() => this.viewModel().isEmpty);

  // --- Public API: Observables (voor Resolvers, Effects, etc.) ---
  readonly isLoading$: Observable<boolean> = this.viewModel$.pipe(map(vm => vm.isLoading));
  readonly isSubmitting$: Observable<boolean> = this.viewModel$.pipe(map(vm => vm.isSubmitting));

  // --- Public API: Action Dispatchers ---

  addItem(payload: AddCartItemPayload): void {
    const tempId = `temp_${Date.now()}`;
    this.store.dispatch(CartActions.addItemSubmitted({ payload, tempId }));
  }

  updateItemQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) { this.removeItem(itemId); }
    else { this.store.dispatch(CartActions.updateItemQuantitySubmitted({ itemId, payload: { quantity } })); }
  }

  removeItem(itemId: string): void { this.store.dispatch(CartActions.removeItemSubmitted({ itemId })); }
  clearCart(): void { this.store.dispatch(CartActions.clearCartSubmitted()); }
}