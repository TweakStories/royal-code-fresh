import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { accountFeature } from './account.feature';
import { AccountEffects } from './account.effects';

export function provideAccountFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(accountFeature),
    provideEffects(AccountEffects),
  ]);
}