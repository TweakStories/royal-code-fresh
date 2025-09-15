/**
 * @file reviews.actions.ts
 * @Version 4.1.0 (Definitive Actions with Error Cleared)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @description
 *   Definitive NgRx actions for the Reviews domain, ensuring `errorCleared` is correctly defined.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { CreateReviewPayload, Review, ReviewTargetEntityType, UpdateReviewPayload, ReviewVoteType, ReviewFilters } from '@royal-code/features/reviews/domain';
import { ReviewSummary } from '@royal-code/shared/domain';
import { StructuredError } from '@royal-code/shared/domain';

export const ReviewsActions = createActionGroup({
  source: 'Reviews',
  events: {
    // === Context & Lifecycle ===
    'Context Set': props<{ targetEntityId: string; targetEntityType: ReviewTargetEntityType }>(),
    'My Reviews Page Opened': emptyProps(),
    'Filters Updated': props<{ filters: Partial<ReviewFilters> }>(),
    'Next Page Loaded': emptyProps(),
    'Data Refreshed': emptyProps(),

    // === Data Loading (met context) ===
    'Load Reviews': props<{ targetEntityId: string; targetEntityType: ReviewTargetEntityType }>(),
    'Load My Reviews': emptyProps(), // <-- NIEUW
    'Load Reviews Success': props<{ reviews: readonly Review[]; totalCount: number; hasMore: boolean }>(),
    'Load Reviews Failure': props<{ error: StructuredError }>(),

    'Load Summary': props<{ targetEntityId: string; targetEntityType: ReviewTargetEntityType }>(),
    'Load Summary Success': props<{ summary: ReviewSummary }>(),
    'Load Summary Failure': props<{ error: StructuredError }>(),

    // === CUD Operations ===
    'Review Submitted': props<{ payload: CreateReviewPayload }>(),
    'Create Review Success': props<{ review: Review }>(),
    'Create Review Failure': props<{ error: StructuredError }>(),

    'Review Update Submitted': props<{ reviewId: string; payload: UpdateReviewPayload }>(),
    'Update Review Success': props<{ reviewUpdate: Update<Review> }>(),
    'Update Review Failure': props<{ error: StructuredError; reviewId: string }>(),

    'Review Deletion Confirmed': props<{ reviewId: string }>(),
    'Delete Review Success': props<{ reviewId: string }>(),
    'Delete Review Failure': props<{ error: StructuredError; reviewId: string }>(),

    // === Voting ===
    'Vote Submitted': props<{ reviewId: string; voteType: ReviewVoteType }>(),
    'Vote Success': props<{ review: Review }>(),
    'Vote Failure': props<{ error: StructuredError; reviewId: string; voteType: ReviewVoteType }>(),

    // === UI State Management ===
    'Error Cleared': emptyProps(), 
    'State Reset': emptyProps(),
  }
});