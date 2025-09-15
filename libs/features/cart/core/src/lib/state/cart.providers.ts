/**
 * @file cart.providers.ts
 * @Version 2.0.0 (Enterprise Blueprint Standard)
 * @description Standalone providers for the Cart feature state.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { cartFeature } from './cart.feature';
import { CartEffects } from './cart.effects';

export function provideCartFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(cartFeature),
    provideEffects(CartEffects)
  ]);
}
