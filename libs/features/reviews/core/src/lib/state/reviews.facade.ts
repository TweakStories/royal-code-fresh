/**
 * @file reviews.facade.ts
 * @Version 5.4.0 (Definitive & Aligned with UI needs)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @description The definitive, stable facade for the Reviews feature, now including all necessary methods.
 */
import { Injectable, Signal, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { ReviewTargetEntityType, UpdateReviewPayload, CreateReviewPayload, ReviewVoteType, ReviewFilters } from '@royal-code/features/reviews/domain';
import { ReviewsActions } from './reviews.actions';
import { selectReviewListViewModel, selectTotalCount, selectIsSubmitting, selectError, selectAllReviews, selectIsLoading, selectHasMore, selectHasReviews, selectTargetEntityId, selectTargetEntityType } from './reviews.feature';
import { ReviewListViewModel } from './reviews.types';

@Injectable({ providedIn: 'root' })
export class ReviewsFacade {
  private readonly store = inject(Store);

  readonly reviewListViewModel: Signal<ReviewListViewModel> = toSignal(
    this.store.select(selectReviewListViewModel),
    { initialValue: this.createInitialViewModel() }
  );
  readonly allReviews = toSignal(this.store.select(selectAllReviews), { initialValue: [] });
  readonly totalCount = toSignal(this.store.select(selectTotalCount), { initialValue: 0 });
  readonly isLoading = toSignal(this.store.select(selectIsLoading), { initialValue: false });
  readonly isSubmitting = toSignal(this.store.select(selectIsSubmitting), { initialValue: false });
  readonly error = toSignal(this.store.select(selectError), { initialValue: null });
  readonly hasMore = toSignal(this.store.select(selectHasMore), { initialValue: false });
  readonly hasReviews = toSignal(this.store.select(selectHasReviews), { initialValue: false });
  readonly reviewSummary = computed(() => this.reviewListViewModel().summary);

  private readonly currentTargetId = this.store.selectSignal(selectTargetEntityId);
  private readonly currentTargetType = this.store.selectSignal(selectTargetEntityType);

  loadMyReviews(): void {
    this.store.dispatch(ReviewsActions.myReviewsPageOpened());
  }
  
  setContext(targetEntityId: string, targetEntityType: ReviewTargetEntityType): void {
    this.store.dispatch(ReviewsActions.contextSet({ targetEntityId, targetEntityType }));
  }

  // <-- DE FIX: updateFilters methode toegevoegd
  updateFilters(filters: Partial<ReviewFilters>): void {
    this.store.dispatch(ReviewsActions.filtersUpdated({ filters }));
    this.store.dispatch(ReviewsActions.loadMyReviews()); // Herlaad data met nieuwe filters
  }
  
  submitReview(payload: CreateReviewPayload): void {
    this.store.dispatch(ReviewsActions.reviewSubmitted({ payload }));
  }

  updateReview(reviewId: string, payload: UpdateReviewPayload): void {
    this.store.dispatch(ReviewsActions.reviewUpdateSubmitted({ reviewId, payload }));
  }

  deleteReview(reviewId: string): void {
    this.store.dispatch(ReviewsActions.reviewDeletionConfirmed({ reviewId }));
  }

  vote(reviewId: string, voteType: ReviewVoteType): void {
    this.store.dispatch(ReviewsActions.voteSubmitted({ reviewId, voteType }));
  }

  loadNextPage(): void {
    this.store.dispatch(ReviewsActions.nextPageLoaded());
  }
  
  loadReviews(): void {
    const targetEntityId = this.currentTargetId();
    const targetEntityType = this.currentTargetType();
    if (targetEntityId && targetEntityType) {
      this.store.dispatch(ReviewsActions.loadReviews({ targetEntityId, targetEntityType }));
    }
  }

  clearError(): void {
    this.store.dispatch(ReviewsActions.errorCleared());
  }

  resetState(): void {
    this.store.dispatch(ReviewsActions.stateReset());
  }
  
  private createInitialViewModel(): ReviewListViewModel {
    return {
      reviews: [], summary: null, isLoading: true, isSubmitting: false, error: null, totalCount: 0,
      filters: { sortBy: 'newest', pageNumber: 1, pageSize: 10 }, hasReviews: false
    };
  }
}