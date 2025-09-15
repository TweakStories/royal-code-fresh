/**
 * @file admin-dashboard.facade.ts
 * @Version 1.1.0 (Domain Model Aligned)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Public API for the Admin Dashboard feature state, now using clean domain models.
 */
import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AdminDashboardActions } from './admin-dashboard.actions';
import { selectViewModel } from './admin-dashboard.feature';
import { AdminDashboardViewModel } from './admin-dashboard.types';

// Import de Domain Models, niet de DTOs voor de initialViewModel
import { DashboardStats, RevenueChartData, Bestseller } from '@royal-code/features/admin-dashboard/domain';
import { AdminOrderListItemDto } from '../dto/backend.dto'; // Type alias
import { ReviewListItemDto } from '@royal-code/features/reviews/domain';
import { StructuredError } from '@royal-code/shared/domain';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AdminDashboardFacade {
  private readonly store = inject(Store);

  // === Primary ViewModel (for UI consumption) ===
  private readonly initialViewModel: AdminDashboardViewModel = {
    stats: null,
    revenueChartData: null,
    bestsellers: [],
    recentOrders: [],
    pendingReviews: [],
    isLoading: true, // Initieel laden
    error: null,
  };

  /**
   * The main ViewModel signal containing all data and states for the dashboard UI.
   */
  public readonly viewModel: Signal<AdminDashboardViewModel> = toSignal(
    this.store.select(selectViewModel),
    { initialValue: this.initialViewModel }
  );

  // === Action Dispatchers ===

  /**
   * Initializes the dashboard by dispatching the action to load all necessary data.
   * This should be called when the dashboard page component is initialized.
   */
  public init(): void {
    this.store.dispatch(AdminDashboardActions.pageInitialized());
  }

  /**
   * Clears any existing error messages from the state.
   */
  public clearError(): void {
    this.store.dispatch(AdminDashboardActions.clearError());
  }
}