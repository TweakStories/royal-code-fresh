/**
 * @file media-filters.model.ts
 * @Version 1.0.1 (Adapted to new Image/MediaType location)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-19
 * @description
 *   Defines the single, authoritative `MediaFilters` interface for all
 *   media-related queries. This model includes pagination, sorting, and
 *   feature-specific filtering options, serving as the consistent contract
 * from UI to backend.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-19
 * @PromptSummary Replicating the products feature structure for a new media feature, following all established architectural rules and providing generated code.
 */
// Import Media (de union type) van deze domain library, omdat het een specifieke media concept is.
import { Media } from '@royal-code/shared/domain';

// Import MediaType en ImageSourceType van de meer algemene shared/domain library.
import { MediaType, ImageSourceType } from '@royal-code/shared/domain'; // <-- BELANGRIJKE WIJZIGING HIER

export interface MediaFilters {
  readonly searchTerm?: string;
  readonly tags?: readonly string[];
  readonly mediaTypes?: readonly MediaType[];
  readonly sourceTypes?: readonly ImageSourceType[];
  readonly uploaderUserId?: string;
  readonly createdAfter?: string; // ISO string
  readonly createdBefore?: string; // ISO string
  readonly minFileSizeBytes?: number;
  readonly maxFileSizeBytes?: number;
  readonly sortBy?: keyof Media | string; // Gecorrigeerd
  readonly sortDirection?: 'asc' | 'desc';
  readonly page?: number;
  readonly pageSize?: number;
  readonly maxSizeMb?: number; // Toegevoegd voor de uploader
}