// libs/features/quests/src/lib/quests.providers.ts
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { questsFeature } from './quests.reducer';
import { QuestsEffects } from './quests.effects';
// Import data service if it needs to be provided here specifically
// import { QuestsDataService } from './data-access/quests-data.service';

/**
 * Provides the NgRx state and effects for the Quests feature.
 * To be used within the route configuration for lazy loading this feature.
 * @returns EnvironmentProviders configured for the Quests feature.
 */
export function provideQuestsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Provide the state slice defined by createFeature.
    provideState(questsFeature),
    // Provide the effects associated with this feature.
    provideEffects([QuestsEffects]),
    // Provide the data service if it's scoped to this feature, otherwise it's likely root-provided.
    // QuestsDataService,
  ]);
}