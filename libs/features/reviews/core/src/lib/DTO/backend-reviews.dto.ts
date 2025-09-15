/**
 * @file backend-reviews.dto.ts
 * @Version 3.0.0 (API Aligned & Definitive)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description
 *   Centralized DTOs for the Reviews API, 100% aligned with the Swagger specification.
 *   This is the definitive structure for API communication.
 */
import { ReviewStatus } from '@royal-code/features/reviews/domain';
import { ReviewSummary } from '@royal-code/shared/domain';
import { PaginatedList } from '@royal-code/shared/utils';

// Corresponds to a single review item within the paginated list
export interface BackendReviewDto {
  readonly id: string;
  readonly rating: number;
  readonly title: string | null;
  readonly reviewText: string;
  readonly isVerifiedPurchase: boolean;
  readonly likes: number;
  readonly dislikes: number;
  readonly status: ReviewStatus; // Matches the domain enum now
  readonly createdAt: string; // ISO string
  readonly authorId: string;
  readonly authorDisplayName: string;
  readonly authorAvatarMediaId: string | null;
  readonly mediaCount: number;
  readonly replyCount: number;
  readonly totalVotes: number;
  readonly likePercentage: number;
  readonly truncatedText: string;
  readonly userVote?: string | null;
}

// Corresponds to the full response of GET /api/Reviews/product/{productId}/reviews
export interface BackendProductReviewsResponseDto {
  readonly productId: string;
  readonly reviews: PaginatedList<BackendReviewDto>;
  readonly ratingStatistics: ReviewSummary;
}