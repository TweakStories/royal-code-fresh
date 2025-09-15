/**
 * @file checkout.actions.ts
 * @Version 4.0.0 (With Shipping Methods)
 * @Description Definitive actions for the Checkout feature.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Address } from '@royal-code/shared/domain';
import { CheckoutStep } from './checkout.types';
import { ShippingMethod, ShippingMethodFilter } from '@royal-code/features/checkout/domain';

export const CheckoutActions = createActionGroup({
  source: 'Checkout',
  events: {
    // Lifecycle
    'Flow Initialized': emptyProps(),
    'State Rehydrated': props<{ persistedState: any }>(),
    'Flow Reset': emptyProps(),

    // Navigation
    'Go To Step': props<{ step: CheckoutStep }>(),

    // Data Submission & Orchestration
    'Shipping Step Submitted': props<{ address: Address, saveAddress: boolean, shouldNavigate: boolean }>(),
    'Shipping Address Set': props<{ address: Address | null }>(),
    'Billing Address Set': props<{ address: Address | null }>(),
    'Payment Method Set': props<{ methodId: string }>(),

    // Shipping Methods
    'Load Shipping Methods': props<{ filters: ShippingMethodFilter }>(),
    'Load Shipping Methods Success': props<{ methods: ShippingMethod[] }>(),
    'Load Shipping Methods Failure': props<{ error: string }>(),
    'Shipping Method Set': props<{ methodId: string }>(),

    // Order Submission Flow
    'Order Submitted': emptyProps(),
  },
});