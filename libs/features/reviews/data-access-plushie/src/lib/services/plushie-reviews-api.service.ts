/**
 * @file plushie-reviews-api.service.ts
 * @Version 6.1.0 (DEFINITIVE - getReviewSummary removed, Aligned with Abstract API)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description
 *   Definitive API service, now fully aligned with the AbstractReviewsApiService
 *   contract. The getReviewSummary method has been removed as per the backend
 *   architectural change, resolving the TS4113 error.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, withLatestFrom } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { AbstractReviewsApiService, ReviewsMappingService, BackendProductReviewsResponseDto, BackendReviewDto } from '@royal-code/features/reviews/core';
import { Review, ReviewTargetEntityType, CreateReviewPayload, UpdateReviewPayload, ReviewVoteType, ReviewFilters, ReviewListItemDto, ReviewSortBy } from '@royal-code/features/reviews/domain';
import { PaginatedList } from '@royal-code/shared/utils';
import { Store } from '@ngrx/store';
import { reviewsFeature } from '@royal-code/features/reviews/core';

@Injectable({ providedIn: 'root' })
export class PlushieReviewsApiService extends AbstractReviewsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly mappingService = inject(ReviewsMappingService);
  private readonly reviewsApiUrl = `${this.config.backendUrl}/Reviews`;
  private readonly store = inject(Store);

  override getReviews(targetEntityId: string, targetEntityType: ReviewTargetEntityType, filters: ReviewFilters): Observable<BackendProductReviewsResponseDto> {
    const url = `${this.reviewsApiUrl}/product/${targetEntityId}/reviews`;
    
    const mappedSortBy = this.mapSortByToBackend(filters.sortBy);

    let params = new HttpParams()
      .set('pageNumber', (filters.pageNumber ?? 1).toString())
      .set('pageSize', (filters.pageSize ?? 10).toString())
      .set('sortBy', mappedSortBy);

    if (filters.filterByRating) {
      params = params.set('filterByRating', filters.filterByRating.toString());
    }
    if (filters.verifiedPurchasesOnly) {
      params = params.set('verifiedPurchasesOnly', 'true');
    }

    return this.http.get<BackendProductReviewsResponseDto>(url, { params });
  }

  // FIX: getReviewSummary is nu verwijderd, omdat deze niet langer in AbstractReviewsApiService staat
  // en de data wordt geleverd via getReviews().

  override createReview(payload: CreateReviewPayload): Observable<Review> {
    return this.http.post<BackendReviewDto>(this.reviewsApiUrl, payload).pipe(
      map(dto => this.mappingService.mapDtoToDomain(dto, payload.targetEntityId, payload.targetEntityType))
    );
  }
  
  override updateReview(reviewId: string, payload: UpdateReviewPayload): Observable<Review> {
    const url = `${this.reviewsApiUrl}/${reviewId}`;
    return this.http.put<BackendReviewDto>(url, payload).pipe(
      withLatestFrom(
        this.store.select(reviewsFeature.selectTargetEntityId),
        this.store.select(reviewsFeature.selectTargetEntityType)
      ),
      map(([dto, targetEntityId, targetEntityType]) => 
        this.mappingService.mapDtoToDomain(dto, targetEntityId || '', targetEntityType || ReviewTargetEntityType.PRODUCT)
      )
    );
  }


  override deleteReview(reviewId: string): Observable<void> {
    const url = `${this.reviewsApiUrl}/${reviewId}`;
    return this.http.delete<void>(url);
  }

  override vote(reviewId: string, voteType: ReviewVoteType): Observable<Review> {
    const url = `${this.reviewsApiUrl}/${reviewId}/vote/${voteType}`;
    return this.http.post<BackendReviewDto>(url, {}).pipe(
      withLatestFrom(
        this.store.select(reviewsFeature.selectTargetEntityId),
        this.store.select(reviewsFeature.selectTargetEntityType)
      ),
      map(([dto, targetEntityId, targetEntityType]) => 
        this.mappingService.mapDtoToDomain(dto, targetEntityId || '', targetEntityType || ReviewTargetEntityType.PRODUCT)
      )
    );
  }
  
  override getMyReviews(filters: ReviewFilters): Observable<PaginatedList<ReviewListItemDto>> {
    console.warn("getMyReviews is still mocked.");
    return of({ items: [], totalCount: 0, pageNumber: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false });
  }

  private mapSortByToBackend(sortBy: ReviewSortBy | undefined): string {
    switch (sortBy) {
      case 'newest': return 'Newest';
      case 'oldest': return 'Oldest';
      case 'highestRated': return 'HighestRated';
      case 'lowestRated': return 'LowestRated';
      case 'mostHelpful': return 'MostHelpful';
      default: return 'Newest';
    }
  }
}