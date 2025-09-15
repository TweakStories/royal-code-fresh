/**
 * @file abstract-admin-reviews-api.service.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Abstract contract for the Admin Reviews API service.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedList } from '@royal-code/shared/utils';
import { AdminReview, AdminReviewListItemDto, UpdateAdminReviewPayload, UpdateAdminReviewStatusPayload } from '@royal-code/features/admin-reviews/domain';
import { ReviewFilters } from '@royal-code/features/reviews/domain';

@Injectable({ providedIn: 'root' })
export abstract class AbstractAdminReviewsApiService {
  abstract getReviews(filters: Partial<ReviewFilters>): Observable<PaginatedList<AdminReviewListItemDto>>;
  abstract getReviewById(id: string): Observable<AdminReviewListItemDto>;
  abstract updateReview(id: string, payload: UpdateAdminReviewPayload): Observable<AdminReviewListItemDto>;
  abstract updateReviewStatus(id: string, payload: UpdateAdminReviewStatusPayload): Observable<void>;
  abstract deleteReview(id: string): Observable<void>;
}