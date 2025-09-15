/**
 * @file checkout.providers.ts
 * @Version 2.0.0 (With Effects)
 * @Description Standalone providers voor de Checkout feature state.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { checkoutFeature } from './checkout.feature';
import { CheckoutEffects } from './checkout.effects';

export function provideCheckoutFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(checkoutFeature),
    provideEffects(CheckoutEffects),
  ]);
}
