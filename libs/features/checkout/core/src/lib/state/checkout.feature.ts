/**
 * @file checkout.feature.ts
 * @Version 5.0.0 (With Shipping Methods)
 * @Description
 *   Definitive NgRx feature definition for Checkout state.
 */
import { createFeature, createSelector, createReducer, on } from '@ngrx/store';
import { CheckoutStep, CheckoutViewModel } from './checkout.types';
import { CheckoutActions } from './checkout.actions';
import { Address } from '@royal-code/shared/domain';
import { ShippingMethod } from '@royal-code/features/checkout/domain';

// --- STATE DEFINITION ---
export interface SerializableCheckoutState {
  activeStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  paymentMethodId: string | null;
  selectedShippingMethodId: string | null;
  shippingMethods: ShippingMethod[];
  isLoadingShippingMethods: boolean;
  isSubmittingOrder: boolean;
  error: string | null;
}

export const initialCheckoutState: SerializableCheckoutState = {
  activeStep: 'shipping',
  completedSteps: [],
  shippingAddress: null,
  billingAddress: null,
  paymentMethodId: null,
  selectedShippingMethodId: null, // <<< DE FIX: TOEGEVOEGD
  shippingMethods: [],
  isLoadingShippingMethods: false,
  isSubmittingOrder: false,
  error: null,
};


// --- NGRX FEATURE ---
export const checkoutFeature = createFeature({
  name: 'checkout',
  reducer: createReducer(
    initialCheckoutState,
    on(CheckoutActions.flowInitialized, () => initialCheckoutState),
    on(CheckoutActions.flowReset, () => initialCheckoutState),
    on(CheckoutActions.stateRehydrated, (state, { persistedState }) => ({ ...state, ...persistedState })),
    on(CheckoutActions.goToStep, (state, { step }) => ({ ...state, activeStep: step })),
    on(CheckoutActions.shippingAddressSet, (state, { address }) => ({
      ...state,
      shippingAddress: address,
      completedSteps: [...new Set([...state.completedSteps, 'shipping'])] as CheckoutStep[],
    })),
    on(CheckoutActions.paymentMethodSet, (state, { methodId }) => ({
      ...state,
      paymentMethodId: methodId,
      completedSteps: [...new Set([...state.completedSteps, 'shipping', 'payment'])] as CheckoutStep[],
    })),
    on(CheckoutActions.shippingMethodSet, (state, { methodId }) => ({
      ...state,
      selectedShippingMethodId: methodId,
    })),
    on(CheckoutActions.loadShippingMethods, (state) => ({ ...state, isLoadingShippingMethods: true, error: null })),
    on(CheckoutActions.loadShippingMethodsSuccess, (state, { methods }) => ({ ...state, isLoadingShippingMethods: false, shippingMethods: methods })),
    on(CheckoutActions.loadShippingMethodsFailure, (state, { error }) => ({ ...state, isLoadingShippingMethods: false, error }))
  ),
    extraSelectors: ({ selectActiveStep, selectCompletedSteps, selectIsSubmittingOrder, selectShippingAddress, selectPaymentMethodId, selectError, selectShippingMethods, selectIsLoadingShippingMethods, selectSelectedShippingMethodId }) => { // <<< DE FIX: selectSelectedShippingMethodId toegevoegd
    const selectCompletedStepsAsSet = createSelector(selectCompletedSteps, (completedArray) => new Set(completedArray));
    const selectCanProceedToPayment = createSelector(selectCompletedStepsAsSet, (completedSet) => completedSet.has('shipping'));
    const selectCanProceedToReview = createSelector(selectCompletedStepsAsSet, (completedSet) => completedSet.has('shipping') && completedSet.has('payment'));

    const selectCheckoutViewModel = createSelector(
      selectActiveStep, selectCompletedStepsAsSet, selectShippingAddress,
      selectPaymentMethodId, selectCanProceedToPayment, selectCanProceedToReview,
      selectIsSubmittingOrder, selectError, selectShippingMethods, selectIsLoadingShippingMethods,
      selectSelectedShippingMethodId, 
      (activeStep, completedSteps, shippingAddress, paymentMethodId, canProceedToPayment, canProceedToReview, isSubmittingOrder, error, shippingMethods, isLoadingShippingMethods, selectedShippingMethodId): CheckoutViewModel => ({ // <<< DE FIX: selectedShippingMethodId als argument
        activeStep, completedSteps, shippingAddress, paymentMethodId,
        selectedShippingMethodId, 
        canProceedToPayment, canProceedToReview, isSubmittingOrder, error,
        shippingMethods, isLoadingShippingMethods
      })
    );
    return { selectCheckoutViewModel };
  }

});

// --- PUBLIC API EXPORTS ---
export const { name: CHECKOUT_FEATURE_KEY, reducer: checkoutReducer, selectCheckoutViewModel } = checkoutFeature;