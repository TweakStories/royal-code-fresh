/**
 * @file user.providers.ts
 * @Version 1.1.0 (Corrected)
 * @Description Biedt de configuratie voor de globale User store via standalone providers.
 *              FIX: Concrete service provider verwijderd.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { userFeature } from './state/user.feature';
import { UserEffects } from './state/user.effects';

export function provideUserFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(userFeature),
    provideEffects(UserEffects),
  ]);
}