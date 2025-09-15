/**
 * @file wishlist.actions.ts
 * @Version 1.1.0 (Added PageOpened action)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description NgRx actions for the Wishlist feature.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { WishlistItem } from '@royal-code/features/wishlist/domain';
import { AddWishlistItemPayload } from '../data-access/abstract-wishlist-api.service';

export const WishlistActions = createActionGroup({
  source: 'Wishlist',
  events: {
    // Lifecycle
    'Page Opened': emptyProps(), // << TOEGEVOEGD

    // Load Wishlist
    'Load Wishlist': emptyProps(),
    'Load Wishlist Success': props<{ items: WishlistItem[] }>(),
    'Load Wishlist Failure': props<{ error: string }>(),

    // Add Item
    'Add Item': props<{ payload: AddWishlistItemPayload }>(),
    'Add Item Success': props<{ item: WishlistItem }>(),
    'Add Item Failure': props<{ error: string }>(),

    // Remove Item
    'Remove Item': props<{ wishlistItemId: string }>(), // << DE FIX: wishlistItemId
    'Remove Item Success': props<{ wishlistItemId: string }>(), // << DE FIX: wishlistItemId
    'Remove Item Failure': props<{ error: string }>(),
  },
});