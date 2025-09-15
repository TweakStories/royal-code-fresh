import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { adminProductsFeature } from './state/admin-products.feature';
import { AdminProductsEffects } from './state/admin-products.effects';
import { AdminProductApiService } from '@royal-code/features/admin-products/data-access';

export function provideAdminProductsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(adminProductsFeature),
    provideEffects(AdminProductsEffects),
    AdminProductApiService,
  ]);
}