/**
 * @file abstract-media-api.service.ts
 * @Version 1.0.0 - Clean Architecture with Domain-Driven Types
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-19
 * @description
 *   Abstract service defining the strict contract for the media data-access
 *   layer. It mandates CRUD operations and uses definitive `MediaFilters`
 *   and CUD payloads from the domain library, enforcing architectural consistency.
 *   Implementations return raw backend DTOs.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-19
 * @PromptSummary Replicating the products feature structure for a new media feature, following all established architectural rules and providing generated code.
 */
import { Observable } from 'rxjs';
import { MediaFilters, CreateMediaPayload, UpdateMediaPayload } from '@royal-code/features/media/domain';
import {
  BackendPaginatedListDto,
  BackendMediaDto,
} from '../DTO/backend.types';
import { HttpEvent } from '@angular/common/http';
import { Media } from '@royal-code/shared/domain';

/**
 * @abstract
 * @class AbstractMediaApiService
 * @description
 *   A pure data-access contract that returns raw backend DTOs. Mapping to
 *   domain models is the responsibility of the `MediaMappingService`.
 */
export abstract class AbstractMediaApiService {
  /**
   * Fetches a raw, paginated list of media DTOs from the backend.
   * @param filters - The domain-defined filters to apply.
   * @param page - The page number to fetch.
   * @param pageSize - The number of items per page.
   * @returns An Observable of the paginated backend DTO.
   */
  abstract getMedia(
    filters?: MediaFilters | null,
    page?: number,
    pageSize?: number
  ): Observable<BackendPaginatedListDto<BackendMediaDto>>;

  /**
   * Fetches a raw, detailed media DTO from the backend by its unique ID.
   * @param mediaId - The ID of the media to fetch.
   * @returns An Observable of the media detail DTO.
   */
  abstract getMediaById(mediaId: string): Observable<BackendMediaDto>;

  /**
   * Creates a new media item on the backend.
   * Note: This typically involves a multipart/form-data request, which the
   * concrete implementation will handle. The payload here is for metadata.
   * @param payload - The domain-defined payload for creating a media item.
   * @param file - The actual file to upload.
   * @returns An Observable of the newly created Media domain model.
   */
  abstract createMedia(payload: CreateMediaPayload, file: File): Observable<Media>;

  /**
   * Updates an existing media item's metadata on the backend.
   * @param id - The ID of the media to update.
   * @param payload - The domain-defined partial payload for the update.
   * @returns An Observable of the updated Media domain model.
   */
  abstract updateMedia(id: string, payload: UpdateMediaPayload): Observable<Media>;

  /**
   * Deletes a media item from the backend by its ID.
   * @param id - The ID of the media item to delete.
   * @returns An Observable that completes upon successful deletion.
   */
  abstract deleteMedia(id: string): Observable<void>;

    /**
   * Uploads a file with progress reporting. This is separate from createMedia,
   * as it's intended for UIs that need to display upload progress, and it
   * returns HttpEvents instead of a fully mapped Media object directly.
   * @param file The file to upload.
   * @param metadata Optional metadata to send along with the file.
   * @returns An Observable of HttpEvent for tracking progress.
   */
  abstract uploadMediaWithProgress(file: File, metadata?: Record<string, string>): Observable<HttpEvent<Media>>;

}

