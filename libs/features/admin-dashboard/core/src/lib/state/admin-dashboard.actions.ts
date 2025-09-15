/**
 * @file admin-dashboard.actions.ts
 * @Version 1.2.0 (Corrected Imports for Types)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description NgRx actions for the Admin Dashboard feature.
 *              Corrected imports for DTOs and Domain Models.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StructuredError } from '@royal-code/shared/domain';
import { PaginatedList } from '@royal-code/shared/utils';

// FIX: Importeer AdminOrderListItemDto en ReviewListItemDto uit onze eigen dto-map
import { AdminOrderListItemDto, ReviewListItemDto } from '../dto/backend.dto'; // <-- Correcte import

// Importeer de Domain Models uit de domain library
import { DashboardStats, RevenueChartData, Bestseller, AdminDashboardOrderListItem } from '@royal-code/features/admin-dashboard/domain';

export const AdminDashboardActions = createActionGroup({
  source: 'Admin Dashboard',
  events: {
    // --- Lifecycle ---
    'Page Initialized': emptyProps(),

    // --- Stats Loading ---
    'Load Stats Requested': emptyProps(),
    'Load Stats Success': props<{ stats: DashboardStats }>(), // Gebruikt Domain Model
    'Load Stats Failure': props<{ error: StructuredError }>(),

    // --- Revenue Chart Loading ---
    'Load Revenue Chart Requested': props<{ days: number }>(),
    'Load Revenue Chart Success': props<{ chartData: RevenueChartData }>(), // Gebruikt Domain Model
    'Load Revenue Chart Failure': props<{ error: StructuredError }>(),

    // --- Bestsellers Loading ---
    'Load Bestsellers Requested': props<{ limit: number }>(),
    'Load Bestsellers Success': props<{ bestsellers: readonly Bestseller[] }>(), // Gebruikt Domain Model
    'Load Bestsellers Failure': props<{ error: StructuredError }>(),

    // --- Recent Orders Loading ---
    'Load Recent Orders Requested': emptyProps(),
    'Load Recent Orders Success': props<{ orders: PaginatedList<AdminDashboardOrderListItem> }>(), 
    'Load Recent Orders Failure': props<{ error: StructuredError }>(),

    // --- Pending Reviews Loading ---
    'Load Pending Reviews Requested': emptyProps(),
    'Load Pending Reviews Success': props<{ reviews: PaginatedList<ReviewListItemDto> }>(),
    'Load Pending Reviews Failure': props<{ error: StructuredError }>(),

    // --- UI Actions ---
    'Clear Error': emptyProps(),
  },
});