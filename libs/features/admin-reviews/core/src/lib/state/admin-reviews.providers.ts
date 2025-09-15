/**
 * @file admin-reviews.providers.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Standalone providers for the Admin Reviews feature state.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { adminReviewsFeature } from './admin-reviews.feature';
import { AdminReviewsEffects } from './admin-reviews.effects';
import { AdminReviewsApiService } from '@royal-code/features/admin-reviews/data-access';
import { AbstractAdminReviewsApiService } from '@royal-code/features/admin-reviews/data-access';
import { AdminReviewsMappingService } from '@royal-code/features/admin-reviews/data-access';

export function provideAdminReviewsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(adminReviewsFeature),
    provideEffects(AdminReviewsEffects),
    AdminReviewsMappingService,
    { provide: AbstractAdminReviewsApiService, useClass: AdminReviewsApiService },
  ]);
}