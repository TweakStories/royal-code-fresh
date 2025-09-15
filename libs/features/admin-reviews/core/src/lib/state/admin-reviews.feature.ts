/**
 * @file admin-reviews.feature.ts
 * @Version 1.1.0 (Fixed Selector Overload Error)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description NgRx feature definition for Admin Review Management.
 */
import { createFeature, createReducer, on, createSelector, MemoizedSelector } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { AdminReview } from '@royal-code/features/admin-reviews/domain';
import { ReviewFilters } from '@royal-code/features/reviews/domain';
import { StructuredError } from '@royal-code/shared/domain';
import { AdminReviewsActions } from './admin-reviews.actions';
import { AdminReviewsViewModel } from './admin-reviews.types';

export const ADMIN_REVIEWS_FEATURE_KEY = 'adminReviews';

export interface AdminReviewsState extends EntityState<AdminReview> {
  selectedReviewId: string | null;
  totalCount: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: StructuredError | null;
  filters: Partial<ReviewFilters>;
}

export const adapter: EntityAdapter<AdminReview> = createEntityAdapter<AdminReview>();

export const initialState: AdminReviewsState = adapter.getInitialState({
  selectedReviewId: null,
  totalCount: 0,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filters: { pageNumber: 1, pageSize: 20 },
});

export const adminReviewsFeature = createFeature({
  name: ADMIN_REVIEWS_FEATURE_KEY,
  reducer: createReducer(
    initialState,
    // Page Init & Filters
    on(AdminReviewsActions.pageInitialized, (state) => ({ ...state, isLoading: true })),
    on(AdminReviewsActions.filtersChanged, (state, { filters }) => ({ ...state, filters: { ...state.filters, ...filters }, isLoading: true })),

    // Load Reviews (List)
    on(AdminReviewsActions.loadReviewsSuccess, (state, { reviews, totalCount }) =>
      adapter.setAll(reviews, { ...state, totalCount, isLoading: false })
    ),
    on(AdminReviewsActions.loadReviewsFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    // Load/Select Review (Detail)
    on(AdminReviewsActions.selectReview, (state, { id }) => ({ ...state, selectedReviewId: id, isLoading: !!id })),
    on(AdminReviewsActions.loadReviewDetailSuccess, (state, { review }) =>
      adapter.upsertOne(review, { ...state, isLoading: false, selectedReviewId: review.id })
    ),
    on(AdminReviewsActions.loadReviewDetailFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    // Update & Delete
    on(AdminReviewsActions.updateReviewSubmitted, AdminReviewsActions.updateStatusSubmitted, AdminReviewsActions.deleteReviewConfirmed, (state) => ({ ...state, isSubmitting: true })),
    on(AdminReviewsActions.updateReviewSuccess, AdminReviewsActions.updateStatusSuccess, (state, { reviewUpdate }) =>
      adapter.updateOne(reviewUpdate, { ...state, isSubmitting: false })
    ),
    on(AdminReviewsActions.deleteReviewSuccess, (state, { id }) =>
      adapter.removeOne(id, { ...state, isSubmitting: false })
    ),
    on(AdminReviewsActions.updateReviewFailure, AdminReviewsActions.updateStatusFailure, AdminReviewsActions.deleteReviewFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),
  ),
  extraSelectors: ({ selectAdminReviewsState, selectEntities, selectSelectedReviewId, selectIsLoading, selectIsSubmitting, selectError, selectTotalCount, selectFilters }) => {
    const { selectAll } = adapter.getSelectors();
    
    // Basis selector voor alle reviews (als array)
    const selectAllAdminReviews = createSelector(selectAdminReviewsState, selectAll);

    // Selector voor de geselecteerde review
    const selectSelectedAdminReview = createSelector(
        selectEntities,
        selectSelectedReviewId,
        (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
    );

    // ViewModel selector
    const selectViewModel: MemoizedSelector<object, AdminReviewsViewModel> = createSelector(
      selectAllAdminReviews, // De lijst van reviews
      selectSelectedAdminReview, // De geselecteerde review
      selectTotalCount, // Direct uit de basisselectors van de feature
      selectIsLoading,
      selectIsSubmitting,
      selectError,
      selectFilters,
      (reviews, selectedReview, totalCount, isLoading, isSubmitting, error, filters): AdminReviewsViewModel => ({
        reviews,
        selectedReview,
        totalCount,
        isLoading,
        isSubmitting,
        error,
        filters
      })
    );

    return {
      selectAllAdminReviews,
      selectSelectedAdminReview,
      selectViewModel,
    };
  }
});