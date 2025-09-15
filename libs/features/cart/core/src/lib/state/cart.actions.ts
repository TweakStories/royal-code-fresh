/**
 * @file cart.actions.ts
 * @Version 7.0.0 (Final)
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AddCartItemPayload, UpdateCartItemPayload } from './cart.types';
import { CartItem as DomainCartItem } from '@royal-code/features/cart/domain';

export const CartActions = createActionGroup({
  source: 'Cart',
  events: {
    // Lifecycle & Sync
    'Cart Initialized': emptyProps(), // <-- VOEG DEZE TOE
    'Sync With Server': emptyProps(),
    'Sync With Server Success': props<{ items: readonly DomainCartItem[]; totalVatAmount?: number; totalDiscountAmount?: number }>(),
    'Sync With Server Error': props<{ error: string }>(),

    // User Actions
    'Add Item Submitted': props<{ payload: AddCartItemPayload; tempId: string }>(),
    'Create New Item': props<{ payload: AddCartItemPayload; tempId: string }>(),
    'Update Item Quantity Submitted': props<{ itemId: string; payload: UpdateCartItemPayload }>(),
    'Remove Item Submitted': props<{ itemId: string }>(),
    'Clear Cart Submitted': emptyProps(),

    // merge anonymous cart
    'Merge Anonymous Cart Submitted': props<{ items: readonly DomainCartItem[] }>(),
    'Merge Anonymous Cart Success': props<{ items: readonly DomainCartItem[] }>(), 
    'Merge Anonymous Cart Failure': props<{ error: string }>(),


    // API Result Actions
    'Add Item Success': props<{ item: DomainCartItem; tempId: string }>(),
    'Add Item Failure': props<{ tempId: string; error: string }>(),
    'Update Item Quantity Success': props<{ itemUpdate: Update<DomainCartItem> }>(),
    'Update Item Quantity Failure': props<{ itemId: string; error: string }>(),
    'Remove Item Success': props<{ itemId: string }>(),
    'Remove Item Failure': props<{ error: string; originalItem: DomainCartItem | null }>(),
    'Clear Cart Success': emptyProps(),
    'Clear Cart Failure': props<{ error: string; originalItems: readonly DomainCartItem[] }>(),
  },
});
