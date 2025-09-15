/**
 * @file media.types.ts
 * @version 2.1.0 (Refactored: Payloads from Domain)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-21
 * @Description
 *   TypeScript type definitions for Media domain state management.
 *   This file now imports `CreateMediaPayload` and `UpdateMediaPayload` from
 *   the `domain` layer, ensuring a single source of truth for these contracts.
 */
import type { Media } from '@royal-code/shared/domain'; // 'type' import
import type { CreateMediaPayload, UpdateMediaPayload, MediaFilters } from '@royal-code/features/media/domain';

export type { MediaFilters, CreateMediaPayload, UpdateMediaPayload };

export interface FeatureError {
  readonly message: string;
  readonly operation: string;
  readonly code?: string;
  readonly context?: Record<string, unknown>;
}

export interface MediaListViewModel {
  // Core Data
  readonly media: readonly Media[];
  readonly selectedMedia: Media | undefined;

  // Operational State
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly error: FeatureError | null;

  // Filter & Search State
  readonly filters: MediaFilters;

  // Pagination & Navigation
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly currentPage: number;
  readonly pageSize: number;
  readonly loadedCount: number;

  // Cache & Performance
  readonly lastFetched: number | null;
  readonly isStale: boolean;

  // Derived Boolean States
  readonly hasMedia: boolean;
  readonly isEmpty: boolean;
  readonly isBusy: boolean;
}