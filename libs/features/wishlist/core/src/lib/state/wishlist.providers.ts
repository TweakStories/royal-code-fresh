/**
 * @file wishlist.providers.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description Standalone providers for the Wishlist feature state.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { wishlistFeature } from './wishlist.feature';
import { WishlistEffects } from './wishlist.effects';

export function provideWishlistFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(wishlistFeature),
    provideEffects(WishlistEffects)
  ]);
}