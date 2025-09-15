/**
 * @file wishlist.feature.ts
 * @Version 1.1.0 (Corrected removeItem and added selectors)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description NgRx feature definition for the Wishlist state, now with correct `removeItem` logic and basic selectors.
 */
import { createFeature, createReducer, on, createSelector } from '@ngrx/store'; // << createSelector toegevoegd
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { WishlistItem } from '@royal-code/features/wishlist/domain';
import { WishlistActions } from './wishlist.actions';

export interface State extends EntityState<WishlistItem> {
  isLoading: boolean;
  error: string | null;
}

export const wishlistAdapter: EntityAdapter<WishlistItem> = createEntityAdapter<WishlistItem>({
  selectId: (item: WishlistItem) => item.id, // Gebruik wishlist item ID als unieke ID
});

export const initialState: State = wishlistAdapter.getInitialState({
  isLoading: false,
  error: null,
});

export const wishlistFeature = createFeature({
  name: 'wishlist',
  reducer: createReducer(
    initialState,
    // Load
    on(WishlistActions.loadWishlist, (state) => ({ ...state, isLoading: true, error: null })),
    on(WishlistActions.loadWishlistSuccess, (state, { items }) =>
      wishlistAdapter.setAll(items, { ...state, isLoading: false })
    ),
    on(WishlistActions.loadWishlistFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    // Add
    on(WishlistActions.addItemSuccess, (state, { item }) =>
      wishlistAdapter.addOne(item, state)
    ),

    // Remove
    on(WishlistActions.removeItemSuccess, (state, { wishlistItemId }) => // << DE FIX: wishlistItemId
      wishlistAdapter.removeOne(wishlistItemId, state) // << DE FIX: wishlistItemId
    )
  ),
  extraSelectors: ({ selectWishlistState }) => {
    const { selectAll, selectEntities } = wishlistAdapter.getSelectors(selectWishlistState);

    return {
      selectAll,
      selectEntities,
      selectIsLoading: createSelector(selectWishlistState, (state) => state.isLoading),
      selectError: createSelector(selectWishlistState, (state) => state.error),
    };
  },
});

// Exporteer de selectors op top-level
export const {
  selectAll,
  selectEntities,
  selectIsLoading, // << NU WEL GEËXPORTEERD
  selectError,     // << NU WEL GEËXPORTEERD
} = wishlistFeature;

// Voor backward compatibility als selectIds/selectTotal nodig zijn
export const { selectIds, selectTotal } = wishlistAdapter.getSelectors(wishlistFeature.selectWishlistState);