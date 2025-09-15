/**
 * @file guides.providers.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Provides the NgRx state and effects for the Guides feature.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { GuidesEffects } from './guides.effects';
import { guidesFeature } from './guides.feature';

export function provideGuidesFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(guidesFeature),
    provideEffects(GuidesEffects),
  ]);
}