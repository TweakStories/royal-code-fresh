/**
 * @file review-filters.model.ts
 * @Version 1.2.0 (Status Filter Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Defines the filters for querying review collections, now including search functionality and status.
 */
import { ReviewStatus } from './review.model'; // Importeer ReviewStatus

export type ReviewSortBy = 'newest' | 'oldest' | 'highestRated' | 'lowestRated' | 'mostHelpful';

export interface ReviewFilters {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: ReviewSortBy;
  filterByRating?: number;
  verifiedPurchasesOnly?: boolean;
  searchTerm?: string;
  status?: ReviewStatus;
}