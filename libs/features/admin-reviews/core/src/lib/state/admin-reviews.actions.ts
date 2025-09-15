/**
 * @file admin-reviews.actions.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description NgRx Actions for Admin Review Management.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AdminReview, UpdateAdminReviewPayload, UpdateAdminReviewStatusPayload } from '@royal-code/features/admin-reviews/domain';
import { ReviewFilters } from '@royal-code/features/reviews/domain';
import { StructuredError } from '@royal-code/shared/domain';

export const AdminReviewsActions = createActionGroup({
  source: 'Admin Reviews',
  events: {
    // === Page Lifecycle & Filters ===
    'Page Initialized': emptyProps(),
    'Filters Changed': props<{ filters: Partial<ReviewFilters> }>(),

    // === Read Operations ===
    'Load Reviews': props<{ filters: Partial<ReviewFilters> }>(),
    'Load Reviews Success': props<{ reviews: AdminReview[], totalCount: number }>(),
    'Load Reviews Failure': props<{ error: StructuredError }>(),

    'Load Review Detail': props<{ id: string }>(),
    'Load Review Detail Success': props<{ review: AdminReview }>(),
    'Load Review Detail Failure': props<{ error: StructuredError }>(),
    'Select Review': props<{ id: string | null }>(),

    // === Update Operations ===
    'Update Review Submitted': props<{ id: string, payload: UpdateAdminReviewPayload }>(),
    'Update Review Success': props<{ reviewUpdate: Update<AdminReview> }>(),
    'Update Review Failure': props<{ error: StructuredError }>(),

    'Update Status Submitted': props<{ id: string, payload: UpdateAdminReviewStatusPayload }>(),
    'Update Status Success': props<{ reviewUpdate: Update<AdminReview> }>(),
    'Update Status Failure': props<{ error: StructuredError }>(),

    // === Delete Operation ===
    'Delete Review Confirmed': props<{ id: string }>(),
    'Delete Review Success': props<{ id: string }>(),
    'Delete Review Failure': props<{ error: StructuredError }>(),
  }
});