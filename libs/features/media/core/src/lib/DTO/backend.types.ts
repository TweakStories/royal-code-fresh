/**
 * @file backend.types.ts (media-core)
 * @version 1.1.0 (Based on Swagger)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-14
 * @Description
 *   Specific DTOs for Media feature, based on Swagger endpoints. Separate from products to avoid coupling.
 *   Includes paginated list, full media, upload body, tags, variants.
 *   Best practice: Own DTOs for media to allow independent evolution.
 */

import { AuditableEntityBase } from "@royal-code/shared/base-models";


// Generic Pagination (re-use if in shared, or define here)
export interface BackendPaginatedListDto<T> {
  readonly items: T[];
  readonly totalCount: number;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

// Media DTO (from GET /Media/{id} and POST upload response)
export interface BackendMediaDto extends AuditableEntityBase {
  readonly id: string;
  readonly type: number;
  readonly title: string | null;
  readonly url: string | null;
  readonly thumbnailUrl: string | null;
  readonly tags: readonly BackendMediaTagDto[] | null;
  readonly altText: string | null;
  readonly sourceType: number | null;
  readonly variants: readonly BackendImageVariantDto[] | null;
  readonly mimeType: string | null;
  readonly uploaderUserId: string | null;
  readonly created: string | null; // ISO date
}

// Tag DTO (from tags array)
export interface BackendMediaTagDto {
  readonly id: string;
  readonly name: string;
  readonly tagType: number;
  readonly tags: readonly string[] | null;
}

// Image Variant DTO (from variants array)
export interface BackendImageVariantDto {
  readonly id: string;
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly format: string;
  readonly purpose: string;
}

// Update Payload (from PUT body)
export interface BackendMediaUpdatePayload {
  readonly id: string;
  readonly title: string | null;
  readonly description: string | null;
  readonly altText: string | null;
}
