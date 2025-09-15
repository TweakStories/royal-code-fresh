/**
 * @file paginated-list.model.ts
 * @Version 2.0.0 (Synchronized with Backend DTO)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-19
 * @Description Defines the generic, reusable interface for paginated data responses
 *              from the backend, now fully aligned with the backend's DTO structure.
 */
export interface PaginatedList<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly pageNumber: number; // Hernoemd van pageIndex voor consistentie
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}