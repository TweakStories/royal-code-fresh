/**
 * @file error.providers.ts
 * @Version 2.0.0 (Modernized for createFeature)
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { errorFeature } from './error.feature';
import { ErrorEffects } from './error.effects';

/**
 * @function provideErrorFeature
 * @description Provides the complete, eager-loaded error feature configuration.
 */
export function provideErrorFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(errorFeature),
    provideEffects(ErrorEffects)
  ]);
}
