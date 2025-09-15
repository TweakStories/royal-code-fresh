/**
 * @file admin-reviews.effects.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description NgRx effects for Admin Review Management.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AdminReviewsActions } from './admin-reviews.actions';
import { adminReviewsFeature } from './admin-reviews.feature';
import { AbstractAdminReviewsApiService } from '../data-access/abstract-admin-reviews-api.service';
import { AdminReviewsMappingService } from '../mappers/admin-reviews-mapping.service';
import { NotificationService } from '@royal-code/ui/notifications';
import { Router } from '@angular/router';
import { StructuredError } from '@royal-code/shared/domain';

@Injectable()
export class AdminReviewsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly apiService = inject(AbstractAdminReviewsApiService);
  private readonly mapper = inject(AdminReviewsMappingService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminReviewsActions.pageInitialized, AdminReviewsActions.filtersChanged),
      withLatestFrom(this.store.select(adminReviewsFeature.selectFilters)),
      map(([, filters]) => AdminReviewsActions.loadReviews({ filters }))
    )
  );

  loadReviews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminReviewsActions.loadReviews),
      switchMap(({ filters }) =>
        this.apiService.getReviews(filters).pipe(
          map(response => AdminReviewsActions.loadReviewsSuccess({
            reviews: response.items.map(dto => this.mapper.mapListItemToAdminReview(dto)),
            totalCount: response.totalCount
          })),
          catchError(error => of(AdminReviewsActions.loadReviewsFailure({ error: this.createError(error, 'Load Reviews') })))
        )
      )
    )
  );
  
  loadReviewDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminReviewsActions.selectReview),
      switchMap(({ id }) => {
        if (!id) return of({ type: 'NO_OP' });
        return this.apiService.getReviewById(id).pipe(
          map(dto => AdminReviewsActions.loadReviewDetailSuccess({ review: this.mapper.mapListItemToAdminReview(dto) })),
          catchError(error => of(AdminReviewsActions.loadReviewDetailFailure({ error: this.createError(error, 'Load Detail') })))
        );
      })
    )
  );

  updateReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminReviewsActions.updateReviewSubmitted),
      switchMap(({ id, payload }) =>
        this.apiService.updateReview(id, payload).pipe(
          tap(() => this.notificationService.showSuccess('Review updated successfully.')),
          map(dto => AdminReviewsActions.updateReviewSuccess({ reviewUpdate: { id, changes: this.mapper.mapListItemToAdminReview(dto) } })),
          catchError(error => {
            this.notificationService.showError('Failed to update review.');
            return of(AdminReviewsActions.updateReviewFailure({ error: this.createError(error, 'Update Review') }));
          })
        )
      )
    )
  );

  updateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminReviewsActions.updateStatusSubmitted),
      switchMap(({ id, payload }) =>
        this.apiService.updateReviewStatus(id, payload).pipe(
          tap(() => this.notificationService.showSuccess('Review status updated.')),
          // We must reload the review to get the updated state
          switchMap(() => this.apiService.getReviewById(id)),
          map(dto => AdminReviewsActions.updateStatusSuccess({ reviewUpdate: { id, changes: this.mapper.mapListItemToAdminReview(dto) } })),
          catchError(error => {
            this.notificationService.showError('Failed to update status.');
            return of(AdminReviewsActions.updateStatusFailure({ error: this.createError(error, 'Update Status') }));
          })
        )
      )
    )
  );

  deleteReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminReviewsActions.deleteReviewConfirmed),
      switchMap(({ id }) =>
        this.apiService.deleteReview(id).pipe(
          tap(() => {
            this.notificationService.showSuccess('Review deleted successfully.');
            this.router.navigate(['/reviews']);
          }),
          map(() => AdminReviewsActions.deleteReviewSuccess({ id })),
          catchError(error => {
            this.notificationService.showError('Failed to delete review.');
            return of(AdminReviewsActions.deleteReviewFailure({ error: this.createError(error, 'Delete Review') }));
          })
        )
      )
    )
  );
  
  private createError(error: any, operation: string): StructuredError {
    return {
      message: error.message || `Operation failed: ${operation}`,
      code: error.status ? `HTTP_${error.status}` : 'UNKNOWN',
      operation: `AdminReviews / ${operation}`,
      context: { error },
      timestamp: Date.now(),
      severity: 'error'
    };
  }
}