/**
 * @file admin-review.model.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Domain models and payloads for Admin Review Management.
 */
import { Review, ReviewStatus } from '@royal-code/features/reviews/domain';

// This is the main domain model for a review in the admin context.
// It can be extended if the admin view needs more data than the user view.
export type AdminReview = Review;

// DTO for the paginated list items from GET /api/AdminReviews
// It largely mirrors the ReviewListItemDto but can be adjusted for admin needs.
export interface AdminReviewListItemDto {
  readonly id: string;
  readonly rating: number;
  readonly title: string | null;
  readonly reviewText: string;
  readonly isVerifiedPurchase: boolean;
  readonly likes: number;
  readonly dislikes: number;
  readonly status: ReviewStatus;
  readonly createdAt: string; // ISO string
  readonly authorId: string;
  readonly authorDisplayName: string;
  readonly authorAvatarMediaId: string | null;
  readonly mediaCount: number;
  readonly replyCount: number;
  readonly totalVotes: number;
  readonly likePercentage: number;
  readonly truncatedText: string;
}

// Payload for PUT /api/AdminReviews/{id}
export interface UpdateAdminReviewPayload {
  rating: number;
  reviewText: string;
  title?: string | null;
  mediaIds?: string[];
}

// Payload for PUT /api/AdminReviews/{id}/status
export interface UpdateAdminReviewStatusPayload {
  newStatus: ReviewStatus;
  moderatorNote?: string;
}