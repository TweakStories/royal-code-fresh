/**
 * @file review-edit-page.component.ts
 * @Version 2.1.0 (Added Debugging for Rating)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Smart component for editing a single review. Now includes debugging for rating discrepancy.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { AdminReviewsFacade } from '@royal-code/features/admin-reviews/core';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { AdminReviewFormComponent } from '../../components/admin-review-form/admin-review-form.component';
import { UpdateAdminReviewPayload, UpdateAdminReviewStatusPayload } from '@royal-code/features/admin-reviews/domain';

@Component({
  selector: 'admin-review-edit-page',
  standalone: true,
  imports: [
    CommonModule, JsonPipe, UiSpinnerComponent,
    AdminReviewFormComponent
  ],
  template: `
    <div class="space-y-6">
       @if (facade.viewModel().isLoading && !facade.viewModel().selectedReview) {
        <div class="flex justify-center items-center h-64">
          <royal-code-ui-spinner size="lg" />
        </div>
      } @else if(facade.viewModel().error; as error) {
        <div class="p-4 bg-destructive/10 text-destructive border border-destructive rounded-xs">
          <p class="font-bold">Error Loading Review</p>
          <pre>{{ error | json }}</pre>
        </div>
      } @else if (facade.viewModel().selectedReview; as review) {
        <!-- DEBUG: Toon de ruwe rating van de backend -->
        <div class="p-2 bg-info/10 border border-info-on/20 rounded-md text-sm">
          <strong>DEBUG: Raw Backend Rating:</strong> {{ review.rating }}
        </div>
        <admin-review-form
          [review]="review"
          [isSubmitting]="facade.viewModel().isSubmitting"
          (saveReview)="onSaveReview($event)"
          (updateStatus)="onUpdateStatus($event)"
          (deleteReview)="onDeleteReview(review.id)"
        />
      } @else {
        <p>Review not found.</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewEditPageComponent implements OnInit {
  protected readonly facade = inject(AdminReviewsFacade);
  private readonly route = inject(ActivatedRoute);
  protected readonly TitleTypeEnum = TitleTypeEnum;

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id)
    ).subscribe(id => {
      this.facade.selectReview(id);
    });
  }

  onSaveReview(payload: UpdateAdminReviewPayload): void {
    const reviewId = this.facade.viewModel()?.selectedReview?.id;
    if (reviewId) {
      this.facade.updateReview(reviewId, payload);
    }
  }

  onUpdateStatus(payload: UpdateAdminReviewStatusPayload): void {
    const reviewId = this.facade.viewModel()?.selectedReview?.id;
    if (reviewId) {
      this.facade.updateStatus(reviewId, payload);
    }
  }

  onDeleteReview(id: string): void {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      this.facade.deleteReview(id);
    }
  }
}