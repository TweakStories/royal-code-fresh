/**
 * @file checkout.types.ts
 * @Version 3.2.0 (With Shipping Method Selection)
 * @Description Types en interfaces voor de Checkout feature state.
 */
import { Address } from '@royal-code/shared/domain';
import { CartItem } from '@royal-code/features/cart/domain';
import { ShippingMethod } from '@royal-code/features/checkout/domain';

export type CheckoutStep = 'shipping' | 'payment' | 'review';

export interface CheckoutState {
  activeStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  paymentMethodId: string | null;
  selectedShippingMethodId: string | null; // <<< DE FIX: Toegevoegd in de State
  shippingMethods: ShippingMethod[];
  isLoadingShippingMethods: boolean;
  isSubmittingOrder: boolean;
  error: string | null;
}

export interface CheckoutViewModel {
  activeStep: CheckoutStep;
  completedSteps: Set<CheckoutStep>;
  shippingAddress: Address | null;
  paymentMethodId: string | null;
  selectedShippingMethodId: string | null; // <<< DE FIX: TOEGEVOEGD AAN DE VIEWMODEL
  shippingMethods: ShippingMethod[];
  isLoadingShippingMethods: boolean;
  canProceedToPayment: boolean;
  canProceedToReview: boolean;
  isSubmittingOrder: boolean;
  error: string | null;
}

export interface SubmitOrderPayload {
  cartItems: readonly CartItem[];
  shippingAddress: Address;
  paymentMethodId: string;
}