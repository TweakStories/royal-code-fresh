// libs/features/challenges/src/challenges.providers.ts
/**
 * @fileoverview Provides NgRx state and effects for the lazy-loaded Challenges feature.
 * @version 1.0.0
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { ChallengesEffects } from './state/challenges.effects';
import { ChallengesState, CHALLENGES_FEATURE_KEY } from './state/challenges.state';
import { challengesReducer } from './state/challenges.reducers';

/** Creates NgRx providers for the Challenges feature. */
export function provideChallengesFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState<ChallengesState>(CHALLENGES_FEATURE_KEY, challengesReducer),
    provideEffects(ChallengesEffects),
  ]);
}
