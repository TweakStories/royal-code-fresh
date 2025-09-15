/**
 * @file product.providers.ts
 * @Version 3.0.0 (Simplified with createFeature)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-14
 * @Description Modern providers using createFeature approach.
 *              This file remains unchanged by the refactor as it correctly consumes the feature object.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

// Deze import blijft werken omdat 'productFeature' nog steeds de reducer bevat.
import { productFeature } from './product.feature';
import { ProductEffects } from './product.effects';

export function provideProductsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(productFeature),
    provideEffects(ProductEffects),
  ]);
}
