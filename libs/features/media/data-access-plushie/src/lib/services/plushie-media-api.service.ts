/**
 * @file plushie-media-api.service.ts
 * @Version 1.0.0 - Enterprise Blueprint Implementation
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-19
 * @description
 *   Concrete implementation of the `AbstractMediaApiService` for the
 *   Plushie Paradise backend. Handles HTTP requests for media management.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-19
 * @PromptSummary Replicating the products feature structure for a new media feature, following all established architectural rules and providing generated code.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '@royal-code/core/config';
import { AbstractMediaApiService, BackendPaginatedListDto, BackendMediaDto, MediaMappingService } from '@royal-code/features/media/core';
import { MediaFilters, CreateMediaPayload, UpdateMediaPayload } from '@royal-code/features/media/domain';
import { Media } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class PlushieMediaApiService extends AbstractMediaApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly mappingService = inject(MediaMappingService); // Mapper for CUD responses
  private readonly apiUrl = `${this.config.backendUrl}/Media`;

  public override getMedia(
    filters?: MediaFilters | null,
    page?: number,
    pageSize?: number
  ): Observable<BackendPaginatedListDto<BackendMediaDto>> {
    const params = this.buildQueryParams(filters, page, pageSize);
    return this.http.get<BackendPaginatedListDto<BackendMediaDto>>(this.apiUrl, { params });
  }

  public override getMediaById(mediaId: string): Observable<BackendMediaDto> {
    return this.http.get<BackendMediaDto>(`${this.apiUrl}/${mediaId}`);
  }

public override createMedia(payload: CreateMediaPayload, file: File): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('metadata', JSON.stringify(payload));

    // De API call geeft een BackendMediaDto terug.
    return this.http.post<BackendMediaDto>(`${this.apiUrl}/upload/image`, formData).pipe(
      // Geef de DTO direct door aan de mapping service, die nu de enige bron van waarheid is voor de URL-logica.
      map(dto => this.mappingService.mapMedia(dto))
    );
  }


  public override updateMedia(id: string, payload: UpdateMediaPayload): Observable<Media> {
    return this.http.put<BackendMediaDto>(`${this.apiUrl}/${id}`, payload).pipe(
      map(dto => this.mappingService.mapMedia(dto)) // Map DTO to Domain Model
    );
  }

  public override deleteMedia(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private buildQueryParams(
    filters?: MediaFilters | null,
    page?: number,
    pageSize?: number
  ): HttpParams {
    let params = new HttpParams()
      .set('pageNumber', (page ?? filters?.page ?? 1).toString())
      .set('pageSize', (pageSize ?? filters?.pageSize ?? 50).toString());

    if (!filters) return params;

    if (filters.searchTerm) params = params.set('searchTerm', filters.searchTerm);
    if (filters.tags?.length) params = params.set('tags', filters.tags.join(','));
    if (filters.mediaTypes?.length) params = params.set('mediaTypes', filters.mediaTypes.join(','));
    if (filters.sourceTypes?.length) params = params.set('sourceTypes', filters.sourceTypes.join(','));
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortDirection) params = params.set('sortDirection', filters.sortDirection);

    return params;
  }

    public override uploadMediaWithProgress(file: File, metadata?: Record<string, string>): Observable<HttpEvent<Media>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    if (metadata) {
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });
    }

    return this.http.post<Media>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

}
