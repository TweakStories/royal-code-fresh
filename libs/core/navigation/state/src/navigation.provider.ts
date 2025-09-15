/**
 * @file navigation.providers.ts
 * @Version 2.0.0 (Simplified `createFeature` Provider)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Provides the NgRx state and effects for the navigation feature using
 *   the modern, simplified `createFeature` approach.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { navigationFeature } from './lib/navigation.feature';
import { NavigationEffects } from './lib/navigation.effects';

/**
 * @description Provides the navigation feature state and effects to the application.
 * @returns {EnvironmentProviders}
 */
export function provideNavigationFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // DE FIX (TS2769): Gebruik de feature direct in provideState
    provideState(navigationFeature),
    provideEffects([NavigationEffects]),
  ]);
}