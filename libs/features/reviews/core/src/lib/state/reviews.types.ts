/**
 * @file reviews.types.ts
 * @version 4.2.0 (Definitive & Aligned)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @description
 *   Defines TypeScript types and interfaces for the reviews feature's NgRx state,
 *   now fully aligned with the needs of the UI components.
 */
import { Review, ReviewFilters } from '@royal-code/features/reviews/domain';
import { ReviewSummary } from '@royal-code/shared/domain';
import { SyncStatus, StructuredError } from '@royal-code/shared/domain';

export interface ReviewWithUIState extends Review {
  uiSyncStatus?: SyncStatus;
  uiError?: StructuredError | null;
  productName?: string;
  productImageUrl?: string;
  totalVotes?: number;
  likePercentage?: number;
  helpfulScore?: number;
}

export interface ReviewListViewModel {
  readonly reviews: readonly ReviewWithUIState[];
  readonly summary: ReviewSummary | null;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly error: StructuredError | null;
  readonly totalCount: number;
  readonly filters: ReviewFilters;
  readonly hasReviews: boolean;
}