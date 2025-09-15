/**
 * @file checkout.facade.ts
 * @Version 3.2.0 (With Shipping Method Selection)
 * @Description Publieke API voor de Checkout state.
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Address } from '@royal-code/shared/domain';
import { CheckoutActions } from './checkout.actions';
import { selectCheckoutViewModel } from './checkout.feature';
import { CheckoutViewModel, CheckoutStep } from './checkout.types';
import { ShippingMethodFilter } from '@royal-code/features/checkout/domain';

@Injectable({ providedIn: 'root' })
export class CheckoutFacade {
  private readonly store = inject(Store);

  // <<< DE FIX: initialViewModel bijgewerkt >>>
  private readonly initialViewModel: CheckoutViewModel = {
    activeStep: 'shipping',
    completedSteps: new Set<CheckoutStep>(),
    shippingAddress: null,
    paymentMethodId: null,
    selectedShippingMethodId: null, // <<< DE FIX: TOEGEVOEGD
    shippingMethods: [],
    isLoadingShippingMethods: false,
    canProceedToPayment: false,
    canProceedToReview: false,
    isSubmittingOrder: false,
    error: null,
  };

  public readonly viewModel$: Observable<CheckoutViewModel> = this.store.select(selectCheckoutViewModel);
public readonly viewModel: Signal<CheckoutViewModel> = toSignal(this.store.select(selectCheckoutViewModel), { initialValue: this.initialViewModel });

  initialize(): void { this.store.dispatch(CheckoutActions.flowInitialized()); }
  goToStep(step: CheckoutStep): void { this.store.dispatch(CheckoutActions.goToStep({ step })); }
setShippingAddress(address: Address | null, saveAddress: boolean, shouldNavigate: boolean = false): void {
    if (address) {
      this.store.dispatch(CheckoutActions.shippingStepSubmitted({ address, saveAddress, shouldNavigate }));
    } else {
      // Als er geen adres is, dispatch dan direct de 'Shipping Address Set' actie met null.
      this.store.dispatch(CheckoutActions.shippingAddressSet({ address: null }));
    }
  }

  
  setPaymentMethod(methodId: string): void {
    this.store.dispatch(CheckoutActions.paymentMethodSet({ methodId }));
    this.store.dispatch(CheckoutActions.goToStep({ step: 'review' }));
  }
  setShippingMethod(methodId: string): void {
    this.store.dispatch(CheckoutActions.shippingMethodSet({ methodId }));
  }

  loadShippingMethods(filters: ShippingMethodFilter): void { this.store.dispatch(CheckoutActions.loadShippingMethods({ filters })); }
  submitOrder(): void { this.store.dispatch(CheckoutActions.orderSubmitted()); }
  resetFlow(): void { this.store.dispatch(CheckoutActions.flowReset()); }
}