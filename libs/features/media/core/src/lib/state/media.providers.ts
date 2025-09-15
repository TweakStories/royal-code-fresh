/**
 * @file media.providers.ts
 * @Version 1.0.0 (Modernized for createFeature)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-19
 * @Description Modern providers using createFeature approach.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-19
 * @PromptSummary Replicating the products feature structure for a new media feature, following all established architectural rules and providing generated code.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { mediaFeature } from './media.feature';
import { MediaEffects } from './media.effects';

export function provideMediaFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(mediaFeature),
    provideEffects(MediaEffects),
  ]);
}
