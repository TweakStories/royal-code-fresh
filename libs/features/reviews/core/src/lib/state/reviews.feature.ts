/**
 * @file reviews.feature.ts
 * @Version 9.1.0 (Definitive - ViewModel Aligned)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @description
 *   Definitive, stable NgRx feature for Reviews state. The ViewModel selector is now
 *   fully aligned with the needs of the UI components, providing all necessary properties.
 */
import { createFeature, createSelector, createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ReviewsActions } from './reviews.actions';
import { ReviewFilters, ReviewTargetEntityType } from '@royal-code/features/reviews/domain';
import { ReviewSummary } from '@royal-code/shared/domain';
import { StructuredError, SyncStatus } from '@royal-code/shared/domain';
import { ReviewWithUIState, ReviewListViewModel } from './reviews.types';

export const reviewAdapter = createEntityAdapter<ReviewWithUIState>();

export interface ReviewsState extends EntityState<ReviewWithUIState> {
  readonly targetEntityId: string | null;
  readonly targetEntityType: ReviewTargetEntityType | null;
  readonly summary: ReviewSummary | null;
  readonly totalCount: number;
  readonly currentPage: number;
  readonly hasMore: boolean;
  readonly filters: ReviewFilters;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly error: StructuredError | null;
}

export const initialReviewsState: ReviewsState = reviewAdapter.getInitialState({
  targetEntityId: null, targetEntityType: null, summary: null,
  totalCount: 0, currentPage: 1, hasMore: true, filters: { sortBy: 'newest', pageNumber: 1, pageSize: 10 },
  isLoading: false, isSubmitting: false, error: null,
});

export const reviewsFeature = createFeature({
  name: 'reviews',
  reducer: createReducer(
    initialReviewsState,
    on(ReviewsActions.contextSet, (state, { targetEntityId, targetEntityType }) => ({ ...initialReviewsState, targetEntityId, targetEntityType, isLoading: true })),
    on(ReviewsActions.myReviewsPageOpened, (state) => ({ ...state, isLoading: true })),
    on(ReviewsActions.filtersUpdated, (state, { filters }) => ({ ...state, filters: { ...state.filters, ...filters }, isLoading: true })),
    on(ReviewsActions.loadReviews, (state) => ({ ...state, isLoading: true })),
    on(ReviewsActions.loadReviewsSuccess, (state, { reviews, totalCount, hasMore }) => reviewAdapter.setAll(reviews.map(r => ({ ...r, uiSyncStatus: SyncStatus.Synced })), { ...state, totalCount, hasMore, isLoading: false, currentPage: state.filters.pageNumber ?? 1 })),
    on(ReviewsActions.loadReviewsFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
    on(ReviewsActions.loadSummarySuccess, (state, { summary }) => ({ ...state, summary })),
    on(ReviewsActions.createReviewSuccess, (state, { review }) => reviewAdapter.addOne({ ...review, uiSyncStatus: SyncStatus.Synced }, { ...state, isSubmitting: false, totalCount: state.totalCount + 1 })),
    on(ReviewsActions.updateReviewSuccess, (state, { reviewUpdate }) => reviewAdapter.updateOne(reviewUpdate, state)),
    on(ReviewsActions.deleteReviewSuccess, (state, { reviewId }) => reviewAdapter.removeOne(reviewId, { ...state, totalCount: state.totalCount - 1 })),
    on(ReviewsActions.voteSuccess, (state, { review }) => reviewAdapter.upsertOne({ ...review, uiSyncStatus: SyncStatus.Synced }, state)),
    on(ReviewsActions.stateReset, () => initialReviewsState),
    on(ReviewsActions.errorCleared, (state) => ({...state, error: null })),
  ),
  extraSelectors: ({ selectReviewsState }) => {
    const { selectAll, selectEntities, selectTotal } = reviewAdapter.getSelectors(selectReviewsState);
    const selectAllReviews = selectAll;
    const selectReviewEntities = selectEntities;
    const selectTargetEntityId = createSelector(selectReviewsState, (state) => state.targetEntityId);
    const selectTargetEntityType = createSelector(selectReviewsState, (state) => state.targetEntityType);
    const selectSummary = createSelector(selectReviewsState, (state) => state.summary);
    const selectIsLoading = createSelector(selectReviewsState, (state) => state.isLoading);
    const selectIsSubmitting = createSelector(selectReviewsState, (state) => state.isSubmitting);
    const selectError = createSelector(selectReviewsState, (state) => state.error);
    const selectTotalCount = createSelector(selectReviewsState, (state) => state.totalCount);
    const selectHasMore = createSelector(selectReviewsState, (state) => state.hasMore);
    const selectHasReviews = createSelector(selectTotalCount, (count) => count > 0);
    const selectFilters = createSelector(selectReviewsState, (state) => state.filters);

    const selectReviewListViewModel = createSelector(
      selectAllReviews, selectSummary, selectIsLoading, selectIsSubmitting, selectError, selectTotalCount, selectFilters, selectHasReviews,
      (reviews, summary, isLoading, isSubmitting, error, totalCount, filters, hasReviews): ReviewListViewModel => ({
        reviews, summary, isLoading, isSubmitting, error, totalCount, filters, hasReviews
      })
    );
    return {
      selectAllReviews, selectReviewEntities, selectReviewListViewModel, selectTargetEntityId, selectTargetEntityType,
      selectSummary, selectIsLoading, selectIsSubmitting, selectError, selectTotalCount, selectHasMore,
      selectHasReviews, selectFilters
    };
  }
});

export const {
  name: REVIEWS_FEATURE_KEY, reducer: reviewsReducer, selectAllReviews,
  selectReviewEntities, selectReviewListViewModel, selectTargetEntityId,
  selectTargetEntityType, selectSummary, selectIsLoading, selectIsSubmitting,
  selectError, selectTotalCount, selectHasMore, selectHasReviews, selectFilters
} = reviewsFeature;