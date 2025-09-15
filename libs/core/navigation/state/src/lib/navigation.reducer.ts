/**
 * @file navigation.reducer.ts
 * @Version 2.0.0 (Entity Adapter & Proper State Export)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   NgRx reducer for the Navigation domain, managing navigation items
 *   using the NgRx Entity Adapter pattern. Correctly exports `NavigationState`.
 */
import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { NavigationItem } from '@royal-code/shared/domain';
import { NavigationActions } from './navigation.actions';

/**
 * @description NgRx Entity Adapter voor `NavigationItem`s.
 */
export const navigationAdapter: EntityAdapter<NavigationItem> = createEntityAdapter<NavigationItem>({
  selectId: (item: NavigationItem) => item.id,
});

/**
 * @interface NavigationState
 * @description De interface voor de Navigation feature state.
 */
export interface NavigationState extends EntityState<NavigationItem> {
  isLoading: boolean;
  error: string | null;
  lastLoaded: number | null;
}

/**
 * @description De initiële staat van de Navigation feature.
 */
export const initialState: NavigationState = navigationAdapter.getInitialState({
  isLoading: false,
  error: null,
  lastLoaded: null,
});

/**
 * @description De reducer functie voor de Navigation feature.
 */
export const navigationReducer = createReducer(
  initialState,
  on(NavigationActions.loadNavigation, (state) => ({ ...state, isLoading: true, error: null })),
  on(NavigationActions.loadNavigationSuccess, (state, { navigation }) =>
    navigationAdapter.setAll(navigation, { ...state, isLoading: false, error: null, lastLoaded: Date.now() })
  ),
  on(NavigationActions.loadNavigationFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
);