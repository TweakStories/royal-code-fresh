/**
 * @file abstract-reviews-api.service.ts
 * @Version 2.0.0 (API Aligned)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description
 *   Defines the abstract contract for fetching review data, aligned with the backend
 *   which returns reviews and summaries in a single call.
 */
import { Observable } from 'rxjs';
import { Review, ReviewTargetEntityType, CreateReviewPayload, UpdateReviewPayload, ReviewVoteType, ReviewFilters, ReviewListItemDto } from '@royal-code/features/reviews/domain';
import { PaginatedList } from '@royal-code/shared/utils';
import { BackendProductReviewsResponseDto } from '../DTO/backend-reviews.dto';

export abstract class AbstractReviewsApiService {
  abstract getMyReviews(filters: ReviewFilters): Observable<PaginatedList<ReviewListItemDto>>; 
  abstract getReviews(targetEntityId: string, targetEntityType: ReviewTargetEntityType, filters: ReviewFilters): Observable<BackendProductReviewsResponseDto>;
  abstract createReview(payload: CreateReviewPayload): Observable<Review>; 
  abstract updateReview(reviewId: string, payload: UpdateReviewPayload): Observable<Review>;
  abstract deleteReview(reviewId: string): Observable<void>;
  abstract vote(reviewId: string, voteType: ReviewVoteType): Observable<Review>;
}