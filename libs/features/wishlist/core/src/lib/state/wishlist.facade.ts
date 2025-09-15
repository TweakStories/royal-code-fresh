/**
 * @file wishlist.facade.ts
 * @Version 2.0.0 (DEFINITIVE - Correct Imports & Signals/Observables)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description Public API for the Wishlist feature state.
 */
import { Injectable, inject, Signal, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WishlistActions } from './wishlist.actions'; // << DE FIX: Import uit .actions
import { selectAll, selectIsLoading, selectError } from './wishlist.feature';
import { AddWishlistItemPayload } from '../data-access/abstract-wishlist-api.service';
import { WishlistItem } from '@royal-code/features/wishlist/domain';

@Injectable({ providedIn: 'root' })
export class WishlistFacade {
  private readonly store = inject(Store);

  readonly allItems = toSignal(this.store.select(selectAll), { initialValue: [] });
  readonly isLoading = toSignal(this.store.select(selectIsLoading), { initialValue: false });
  readonly error = toSignal(this.store.select(selectError), { initialValue: null });
  readonly wishlistCount = computed(() => this.allItems().length);

  isProductInWishlist(productId$: Observable<string>, variantId$?: Observable<string | undefined>): Signal<boolean> {
    return toSignal(
      combineLatest([productId$, variantId$ ?? of(undefined)]).pipe(
        map(([pid, vid]) => {
          return this.allItems().some((item: WishlistItem) =>
            item.productId === pid && (vid ? item.variantId === vid : true)
          );
        })
      ),
      { initialValue: false }
    );
  }
  
  findWishlistItem(productId: string, variantId?: string): WishlistItem | undefined {
    return this.allItems().find((item: WishlistItem) =>
      item.productId === productId && (variantId ? item.variantId === variantId : true)
    );
  }

  toggleWishlistItem(payload: AddWishlistItemPayload): void {
    const existingItem = this.findWishlistItem(payload.productId, payload.variantId);
    if (existingItem) {
      this.store.dispatch(WishlistActions.removeItem({ wishlistItemId: existingItem.id }));
    } else {
      this.store.dispatch(WishlistActions.addItem({ payload }));
    }
  }

  loadWishlist(): void {
    this.store.dispatch(WishlistActions.loadWishlist());
  }
}