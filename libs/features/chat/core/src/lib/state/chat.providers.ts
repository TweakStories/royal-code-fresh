/**
 * @file chat.providers.ts
 * @description Provides the NgRx feature state and effects for the chat module.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { chatFeature } from './chat.feature';
import { ChatEffects } from './chat.effects';

export function provideChatFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(chatFeature),
    provideEffects(ChatEffects),
  ]);
}
