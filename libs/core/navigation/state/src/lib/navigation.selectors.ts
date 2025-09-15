// libs/core/state/navigation/navigation.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NavigationState } from './navigation.state';
import { navigationFeatureKey } from './navigation.reducer';

export const selectNavigationState = createFeatureSelector<NavigationState>(navigationFeatureKey);

export const selectRawNavigationItems = createSelector(
  selectNavigationState,
  (state) => state.items
);

export const selectNavigationLoading = createSelector(
  selectNavigationState,
  (state) => state.loading
);

export const selectNavigationError = createSelector(
  selectNavigationState,
  (state) => state.error
);
