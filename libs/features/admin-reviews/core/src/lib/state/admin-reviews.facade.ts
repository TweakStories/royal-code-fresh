/**
 * @file admin-reviews.facade.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Public API for the Admin Reviews state.
 */
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminReviewsActions } from './admin-reviews.actions';
import { adminReviewsFeature } from './admin-reviews.feature';
import { UpdateAdminReviewPayload, UpdateAdminReviewStatusPayload } from '@royal-code/features/admin-reviews/domain';

@Injectable({ providedIn: 'root' })
export class AdminReviewsFacade {
  private readonly store = inject(Store);

readonly viewModel = toSignal(this.store.select(adminReviewsFeature.selectViewModel), {
    initialValue: { 
      reviews: [],
      selectedReview: undefined,
      totalCount: 0,
      isLoading: true, 
      isSubmitting: false,
      error: null,
      filters: { pageNumber: 1, pageSize: 20 }
    }
  });

  initPage(): void {
    this.store.dispatch(AdminReviewsActions.pageInitialized());
  }

  selectReview(id: string | null): void {
    this.store.dispatch(AdminReviewsActions.selectReview({ id }));
  }

  updateReview(id: string, payload: UpdateAdminReviewPayload): void {
    this.store.dispatch(AdminReviewsActions.updateReviewSubmitted({ id, payload }));
  }

  updateStatus(id: string, payload: UpdateAdminReviewStatusPayload): void {
    this.store.dispatch(AdminReviewsActions.updateStatusSubmitted({ id, payload }));
  }

  deleteReview(id: string): void {
    this.store.dispatch(AdminReviewsActions.deleteReviewConfirmed({ id }));
  }
}