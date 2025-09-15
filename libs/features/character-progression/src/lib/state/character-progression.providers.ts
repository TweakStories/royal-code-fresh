// libs/features/character-progression/src/lib/state/character-progression.providers.ts
/**
 * @fileoverview Provides the NgRx state and effects for the Character Progression feature.
 * This function is typically used in the application's root configuration or a core module
 * to eagerly load the character progression state management.
 * @version 1.0.0
 * @author ChallengerAppDevAI
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { characterProgressionReducer } from './character-progression.reducers';
import { CharacterProgressionEffects } from './character-progression.effects';
import { CHARACTER_PROGRESSION_FEATURE_KEY, CharacterProgressionState } from './character-progression.state';
// Data service is root-provided, Facade is root-provided.

/**
 * @function provideCharacterProgressionFeature
 * @description Creates NgRx providers for the Character Progression feature state and effects.
 * Intended for eager loading in the application's root configuration.
 *
 * @returns {EnvironmentProviders} EnvironmentProviders for the Character Progression feature.
 */
export function provideCharacterProgressionFeature(): EnvironmentProviders {
  console.log('>>> PROVIDING CHARACTER PROGRESSION FEATURE STATE/EFFECTS (Eager) <<<');
  return makeEnvironmentProviders([
    // Provide the state slice with its feature key and reducer.
    provideState<CharacterProgressionState>(CHARACTER_PROGRESSION_FEATURE_KEY, characterProgressionReducer),
    // Provide the effects associated with this feature.
    provideEffects([CharacterProgressionEffects]),
  ]);
}