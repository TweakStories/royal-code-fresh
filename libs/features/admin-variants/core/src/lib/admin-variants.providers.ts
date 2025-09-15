/**
 * @file admin-variants.providers.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description Provides the NgRx state and effects for the Admin Variants feature.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { adminVariantsFeature } from './state/admin-variants.feature';
import { AdminVariantsEffects } from './state/admin-variants.effects';
import { AdminVariantsApiService } from '@royal-code/features/admin-variants/data-access';

export function provideAdminVariantsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(adminVariantsFeature),
    provideEffects(AdminVariantsEffects),
    AdminVariantsApiService,
  ]);
}