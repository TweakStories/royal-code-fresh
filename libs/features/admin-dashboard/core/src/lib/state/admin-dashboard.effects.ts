/**
 * @file admin-dashboard.effects.ts
 * @Version 1.2.0 (Mapped & Enterprise Ready with Error Handling)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description NgRx effects for the Admin Dashboard, now using the mapping service
 *              to convert DTOs to domain models before dispatching success actions.
 *              Also uses structured error handling.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AdminDashboardActions } from './admin-dashboard.actions';
import { AbstractAdminDashboardApiService } from '../data-access/abstract-admin-dashboard-api.service';
import { AdminDashboardMappingService } from '../mappers/admin-dashboard-mapping.service'; // <-- MAPPER
import { StructuredError } from '@royal-code/shared/domain';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorActions } from '@royal-code/store/error'; // Global Error Actions
import { Store } from '@ngrx/store'; // Voor dispatching globale error

@Injectable()
export class AdminDashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly apiService = inject(AbstractAdminDashboardApiService);
  private readonly mapper = inject(AdminDashboardMappingService); // <-- MAPPER INJECTIE
  private readonly store = inject(Store); // Voor globale error dispatch

  // === Orchestrator Effect ===
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminDashboardActions.pageInitialized),
      switchMap(() => [
        AdminDashboardActions.loadStatsRequested(),
        AdminDashboardActions.loadRevenueChartRequested({ days: 30 }),
        AdminDashboardActions.loadBestsellersRequested({ limit: 5 }),
        AdminDashboardActions.loadRecentOrdersRequested(),
        AdminDashboardActions.loadPendingReviewsRequested(),
      ])
    )
  );

  // === Individual Data Loading Effects ===

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminDashboardActions.loadStatsRequested),
      switchMap(() =>
        this.apiService.getDashboardStats().pipe(
          map(dto => AdminDashboardActions.loadStatsSuccess({ stats: this.mapper.mapStats(dto) })),
          catchError(error => {
            const structuredError = this.formatError(error, 'LoadStats');
            this.store.dispatch(ErrorActions.reportError({ error: structuredError })); // Rapportage
            return of(AdminDashboardActions.loadStatsFailure({ error: structuredError }));
          })
        )
      )
    )
  );

  loadRevenueChart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminDashboardActions.loadRevenueChartRequested),
      switchMap(({ days }) =>
        this.apiService.getRevenueChartData(days).pipe(
          map(dto => AdminDashboardActions.loadRevenueChartSuccess({ chartData: this.mapper.mapRevenueChart(dto) })),
          catchError(error => {
            const structuredError = this.formatError(error, 'LoadRevenueChart');
            this.store.dispatch(ErrorActions.reportError({ error: structuredError })); // Rapportage
            return of(AdminDashboardActions.loadRevenueChartFailure({ error: structuredError }));
          })
        )
      )
    )
  );

  loadBestsellers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminDashboardActions.loadBestsellersRequested),
      switchMap(({ limit }) =>
        this.apiService.getBestsellers(limit).pipe(
          map(dto => AdminDashboardActions.loadBestsellersSuccess({ bestsellers: this.mapper.mapBestsellers(dto) })),
          catchError(error => {
            const structuredError = this.formatError(error, 'LoadBestsellers');
            this.store.dispatch(ErrorActions.reportError({ error: structuredError })); // Rapportage
            return of(AdminDashboardActions.loadBestsellersFailure({ error: structuredError }));
          })
        )
      )
    )
  );

  loadRecentOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminDashboardActions.loadRecentOrdersRequested),
      switchMap(() =>
        // De apiService retourneert nu PaginatedList<AdminDashboardOrderListItem>
        this.apiService.getRecentOrders(1, 5, 'orderDate', 'desc').pipe(
          map(orders => AdminDashboardActions.loadRecentOrdersSuccess({ orders })),
          catchError(error => {
            const structuredError = this.formatError(error, 'LoadRecentOrders');
            this.store.dispatch(ErrorActions.reportError({ error: structuredError }));
            return of(AdminDashboardActions.loadRecentOrdersFailure({ error: structuredError }));
          })
        )
      )
    )
  );



  loadPendingReviews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminDashboardActions.loadPendingReviewsRequested),
      switchMap(() =>
        this.apiService.getPendingReviews(1, 3, 'createdAt', 'pending').pipe( // Sorteer op 'createdAt', status 'pending'
          map(reviews => AdminDashboardActions.loadPendingReviewsSuccess({ reviews })), // DTO is al gemapt/bruikbaar
          catchError(error => {
            const structuredError = this.formatError(error, 'LoadPendingReviews');
            this.store.dispatch(ErrorActions.reportError({ error: structuredError })); // Rapportage
            return of(AdminDashboardActions.loadPendingReviewsFailure({ error: structuredError }));
          })
        )
      )
    )
  );

  // === Utility Functions ===
  private formatError(error: unknown, operation: string): StructuredError {
    const httpError = error as HttpErrorResponse;
    const baseMessage = `Failed to ${operation}.`;
    const details = httpError?.error?.message || httpError?.message || 'An unknown error occurred.';

    return {
      message: `${baseMessage} ${details}`,
      code: `DASHBOARD_${operation.toUpperCase()}_FAILURE`,
      context: {
        status: httpError?.status,
        url: httpError?.url,
        fullError: httpError // Voeg de volledige HttpErrorResponse toe voor gedetailleerde logging
      },
      timestamp: Date.now(),
      severity: 'error'
    };
  }
}