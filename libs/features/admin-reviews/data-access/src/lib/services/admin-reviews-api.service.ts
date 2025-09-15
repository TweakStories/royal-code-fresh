/**
 * @file admin-reviews-api.service.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Concrete implementation of the Admin Reviews API service.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { PaginatedList } from '@royal-code/shared/utils';
import { AbstractAdminReviewsApiService } from '@royal-code/features/admin-reviews/core';
import { AdminReviewListItemDto, UpdateAdminReviewPayload, UpdateAdminReviewStatusPayload } from '@royal-code/features/admin-reviews/domain';
import { ReviewFilters, ReviewStatus } from '@royal-code/features/reviews/domain';

@Injectable({ providedIn: 'root' })
export class AdminReviewsApiService extends AbstractAdminReviewsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/AdminReviews`;

getReviews(filters: Partial<ReviewFilters>): Observable<PaginatedList<AdminReviewListItemDto>> {
    let params = new HttpParams()
      .set('PageNumber', (filters.pageNumber ?? 1).toString())
      .set('PageSize', (filters.pageSize ?? 20).toString());

    if (filters.sortBy) params = params.set('SortBy', filters.sortBy);
    if (filters.searchTerm) params = params.set('SearchTerm', filters.searchTerm); 
    if (filters.status) params = params.set('FilterByStatus', filters.status); 

    return this.http.get<PaginatedList<AdminReviewListItemDto>>(this.apiUrl, { params });
  }


  getReviewById(id: string): Observable<AdminReviewListItemDto> {
    return this.http.get<AdminReviewListItemDto>(`${this.apiUrl}/${id}`);
  }

  updateReview(id: string, payload: UpdateAdminReviewPayload): Observable<AdminReviewListItemDto> {
    return this.http.put<AdminReviewListItemDto>(`${this.apiUrl}/${id}`, payload);
  }

  updateReviewStatus(id: string, payload: UpdateAdminReviewStatusPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, payload);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}