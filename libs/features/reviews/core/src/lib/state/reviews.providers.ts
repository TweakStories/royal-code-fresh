/**
 * @file reviews.providers.ts
 * @Version 1.0.0 (Modernized for createFeature)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-05
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-05
 * @PromptSummary "Generate a standalone provider function for the reviews feature, mirroring the new cart standard."
 * @Description
 *   Provides the complete reviews feature configuration using modern, standalone Angular providers.
 *   This function leverages the `reviewsFeature` object from `reviews.feature.ts` to register
 *   the state and effects, ensuring type safety and consistency. It should be used to
 *   register the feature, typically within a lazy-loaded route configuration.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { reviewsFeature } from './reviews.feature';
import { ReviewsEffects } from './reviews.effects';

export function provideReviewsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(reviewsFeature),
    provideEffects(ReviewsEffects)
  ]);
}
