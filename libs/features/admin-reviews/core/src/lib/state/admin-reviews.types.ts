/**
 * @file admin-reviews.types.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Type definitions for the Admin Reviews feature state.
 */
import { AdminReview } from '@royal-code/features/admin-reviews/domain';
import { ReviewFilters } from '@royal-code/features/reviews/domain';
import { StructuredError } from '@royal-code/shared/domain';

export interface AdminReviewsViewModel {
  reviews: readonly AdminReview[];
  selectedReview: AdminReview | undefined;
  totalCount: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: StructuredError | null;
  filters: Partial<ReviewFilters>;
}