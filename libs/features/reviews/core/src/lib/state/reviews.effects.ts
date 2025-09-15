/**
 * @file reviews.effects.ts
 * @Version 9.2.0 (Definitive - All Compiler Errors Fixed)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @description
 *   Definitive effects for the Reviews feature. This version resolves all previous
 *   compiler errors by using correct relative import paths, respecting readonly
 *   properties by passing context to the mapping service, and correctly typing
 *   all API responses and mappings.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom, tap, mergeMap } from 'rxjs/operators';
import { ReviewsActions } from './reviews.actions';
import { AbstractReviewsApiService } from '../data-access/abstract-reviews-api.service';
import { reviewsFeature } from './reviews.feature';
import { StructuredError } from '@royal-code/shared/domain';
import { NotificationService } from '@royal-code/ui/notifications';
import { ReviewsMappingService } from '../mappers/reviews-mapping.service';
// FIX: Correct relative import path
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorActions } from '@royal-code/store/error';
import { BackendReviewDto } from '../DTO/backend-reviews.dto';

@Injectable()
export class ReviewsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly reviewsApiService = inject(AbstractReviewsApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly mappingService = inject(ReviewsMappingService);

  triggerInitialDataLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReviewsActions.contextSet),
      map(({ targetEntityId, targetEntityType }) => 
        ReviewsActions.loadReviews({ targetEntityId, targetEntityType })
      )
    )
  );

  loadReviewsAndSummary$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReviewsActions.loadReviews),
      withLatestFrom(this.store.select(reviewsFeature.selectFilters)),
      switchMap(([{ targetEntityId, targetEntityType }, filters]) =>
        this.reviewsApiService.getReviews(targetEntityId, targetEntityType, filters).pipe(
          mergeMap(response => {
            const paginatedReviews = response.reviews;
            const summary = response.ratingStatistics;
            
            const reviews = paginatedReviews.items.map((dto: BackendReviewDto) => 
                // FIX: Pass context to the mapper, don't modify readonly property later
                this.mappingService.mapDtoToDomain(dto, targetEntityId, targetEntityType)
            );

            return [
              ReviewsActions.loadReviewsSuccess({ 
                reviews, 
                totalCount: paginatedReviews.totalCount, 
                hasMore: paginatedReviews.hasNextPage 
              }),
              ReviewsActions.loadSummarySuccess({ summary })
            ];
          }),
          catchError((error: HttpErrorResponse) => {
              const structuredError: StructuredError = {
                source: '[API Reviews]',
                message: 'Er is een serverfout opgetreden bij het ophalen van de reviews.',
                severity: 'error',
                context: { status: error.status, url: error.url },
                timestamp: Date.now()
              };
              return of(
                ErrorActions.reportError({ error: structuredError }),
                ReviewsActions.loadReviewsFailure({ error: structuredError })
              );
          })
        )
      )
    )
  );
  
  createReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReviewsActions.reviewSubmitted),
      switchMap(({ payload }) =>
        this.reviewsApiService.createReview(payload).pipe(
          tap(() => this.notificationService.showSuccess('Review succesvol geplaatst!')),
          map(review => ReviewsActions.createReviewSuccess({ review })),
          catchError(error => {
              const structuredError: StructuredError = { message: 'Failed to create review.', code: 'REVIEW_CREATE_FAIL', context: { error }, timestamp: Date.now(), severity: 'error' };
              return of(ReviewsActions.createReviewFailure({ error: structuredError }));
          })
        )
      )
    )
  );
  
  updateReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReviewsActions.reviewUpdateSubmitted),
      switchMap(({ reviewId, payload }) =>
        this.reviewsApiService.updateReview(reviewId, payload).pipe(
          tap(() => this.notificationService.showSuccess('Review succesvol bijgewerkt!')),
          map(updatedReview => ReviewsActions.updateReviewSuccess({ reviewUpdate: { id: reviewId, changes: updatedReview } })),
          catchError(error => {
              const structuredError: StructuredError = { message: 'Failed to update review.', code: 'REVIEW_UPDATE_FAIL', context: { error }, timestamp: Date.now(), severity: 'error' };
              return of(ReviewsActions.updateReviewFailure({ error: structuredError, reviewId }));
          })
        )
      )
    )
  );

  deleteReview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReviewsActions.reviewDeletionConfirmed),
      switchMap(({ reviewId }) =>
        this.reviewsApiService.deleteReview(reviewId).pipe(
          tap(() => this.notificationService.showSuccess('Review succesvol verwijderd.')),
          map(() => ReviewsActions.deleteReviewSuccess({ reviewId })),
          catchError(error => {
             const structuredError: StructuredError = { message: 'Failed to delete review.', code: 'REVIEW_DELETE_FAIL', context: { error }, timestamp: Date.now(), severity: 'error' };
             return of(ReviewsActions.deleteReviewFailure({ error: structuredError, reviewId }));
          })
        )
      )
    )
  );

  vote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReviewsActions.voteSubmitted),
      switchMap(({ reviewId, voteType }) =>
        this.reviewsApiService.vote(reviewId, voteType).pipe(
          map(review => ReviewsActions.voteSuccess({ review })),
          catchError(error => {
             const structuredError: StructuredError = { message: 'Failed to submit vote.', code: 'REVIEW_VOTE_FAIL', context: { error }, timestamp: Date.now(), severity: 'error' };
             return of(ReviewsActions.voteFailure({ error: structuredError, reviewId, voteType }));
          })
        )
      )
    )
  );
}