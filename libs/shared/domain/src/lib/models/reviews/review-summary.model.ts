/**
 * @file review-summary.model.ts (in shared/domain)
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description Shared data model for a summary of reviews for any entity.
 */
export interface ReviewSummary {
  targetEntityId: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [rating: number]: number };
}