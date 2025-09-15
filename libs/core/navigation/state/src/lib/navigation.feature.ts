/**
 * @file navigation.feature.ts
 * @Version 2.0.0 (Feature Creation & Selector Export)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   NgRx feature definition for the Navigation domain, co-locating reducer
 *   and selectors. Ensures proper export of the feature and its selectors.
 */
import { createFeature, createSelector } from '@ngrx/store';
import { navigationReducer, navigationAdapter, NavigationState } from './navigation.reducer';

export const NAVIGATION_FEATURE_KEY = 'navigation';

export const navigationFeature = createFeature({
  name: NAVIGATION_FEATURE_KEY,
  reducer: navigationReducer,
  extraSelectors: ({ selectNavigationState }) => {
    const { selectAll } = navigationAdapter.getSelectors();

    const selectAllNavigation = createSelector(
      selectNavigationState,
      (state) => selectAll(state)
    );

    return {
      selectAllNavigation,
    };
  },
});

export const {
  name,
  reducer,
  selectNavigationState,
  selectIsLoading,
  selectError,
  selectAllNavigation,
} = navigationFeature;

// DE FIX (TS1205): Gebruik 'export type' voor re-exporting in isolated modules.
export type { NavigationState };