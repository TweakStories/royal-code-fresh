/**
 * @file wishlist.effects.ts
 * @Version 3.0.0 (Consumes Mapped Domain Models Directly from API Service)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description NgRx effects for handling wishlist side effects, now consuming already-mapped domain models from the API service.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { WishlistActions } from './wishlist.actions';
import { AbstractWishlistApiService } from '../data-access/abstract-wishlist-api.service';
import { NotificationService } from '@royal-code/ui/notifications';
import { LoggerService } from '@royal-code/core/core-logging';
// import { WishlistMappingService } from '../mappers/wishlist-mapping.service'; // << DE FIX: Deze is niet meer nodig

@Injectable()
export class WishlistEffects {
  private readonly actions$ = inject(Actions);
  private readonly apiService = inject(AbstractWishlistApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  // private readonly mappingService = inject(WishlistMappingService); // << DE FIX: Mapper is hier niet meer nodig

  pageOpened$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WishlistActions.pageOpened),
      tap(() => this.logger.info('[WishlistEffects] Page opened, dispatching Load Wishlist.')),
      map(() => WishlistActions.loadWishlist())
    )
  );

  loadWishlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WishlistActions.loadWishlist),
      switchMap(() =>
        this.apiService.getWishlist().pipe(
          // << DE FIX: Items zijn al gemapt door de service >>
          map(items => WishlistActions.loadWishlistSuccess({ items })),
          catchError(error => {
            this.logger.error('[WishlistEffects] Failed to load wishlist:', error);
            this.notificationService.showError('Kon verlanglijst niet laden.');
            return of(WishlistActions.loadWishlistFailure({ error: error.message }));
          })
        )
      )
    )
  );

  addItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WishlistActions.addItem),
      switchMap(({ payload }) =>
        this.apiService.addItem(payload).pipe(
          // << DE FIX: Item is al gemapt door de service >>
          map(item => {
            this.notificationService.showSuccess('Product toegevoegd aan verlanglijst!');
            return WishlistActions.addItemSuccess({ item });
          }),
          catchError(error => {
            this.logger.error('[WishlistEffects] Failed to add item to wishlist:', error);
            this.notificationService.showError('Kon product niet toevoegen.');
            return of(WishlistActions.addItemFailure({ error: error.message }));
          })
        )
      )
    )
  );

  removeItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WishlistActions.removeItem),
      switchMap(({ wishlistItemId }) =>
        this.apiService.removeItem(wishlistItemId).pipe(
          map(() => {
            this.notificationService.showSuccess('Product verwijderd van verlanglijst.');
            return WishlistActions.removeItemSuccess({ wishlistItemId });
          }),
          catchError(error => {
            this.logger.error('[WishlistEffects] Failed to remove item from wishlist:', error);
            this.notificationService.showError('Kon product niet verwijderen.');
            return of(WishlistActions.removeItemFailure({ error: error.message }));
          })
        )
      )
    )
  );
}