/**
 * @file auth.providers.ts
 * @Version 3.0.0 (Modernized for createFeature)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-16
 * @Description
 *   Levert de NgRx-providers voor de authenticatie-feature. Deze functie maakt gebruik
 *   van de moderne `provideState` met een `authFeature` object, wat de configuratie
 *   vereenvoudigt en de koppeling tussen state, reducer en selectors garandeert.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from './state/auth.effects';
import { authFeature } from './state/auth.feature';

export function provideAuthFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(authFeature),
    provideEffects(AuthEffects),
  ]);
}
