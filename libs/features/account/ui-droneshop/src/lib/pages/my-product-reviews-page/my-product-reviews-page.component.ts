/**
 * @file my-product-reviews-page.component.ts
 * @Version 11.1.0 (Definitive - Search Removed)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description The definitive component for managing user reviews. This version removes
 *              the search functionality to align with the backend API contract.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-09-02
 * @PromptSummary Fix review-related compilation errors by aligning the viewmodel and facade with the UI's expectations.
 */
import { ChangeDetectionStrategy, Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { NotificationService } from '@royal-code/ui/notifications';
import { UiTitleComponent } from '@royal-code/ui/title';
import { SelectOption, TitleTypeEnum } from '@royal-code/shared/domain';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiPaginationComponent } from '@royal-code/ui/pagination';

import { ReviewsFacade, ReviewWithUIState } from '@royal-code/features/reviews/core';
import { CreateReviewFormComponent, PlushieReviewCardComponent } from '@royal-code/features/reviews/ui-plushie';
import { ReviewTargetEntityType, UpdateReviewPayload, ReviewVoteType, ReviewSortBy } from '@royal-code/features/reviews/domain';
import { UiSelectComponent } from '@royal-code/ui/forms';

@Component({
  selector: 'droneshop-my-product-reviews-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule, UiTitleComponent,
    UiSpinnerComponent, UiParagraphComponent,
    UiSelectComponent, UiPaginationComponent, PlushieReviewCardComponent,
  ],
  template: `
    <div class="space-y-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'navigation.myReviews' | translate" />
      <royal-code-ui-paragraph color="muted">{{ 'account.myReviews.pageDescription' | translate }}</royal-code-ui-paragraph>

      <div class="flex flex-col sm:flex-row justify-end gap-4">
        <royal-code-ui-select [options]="sortOptions()" (ngModelChange)="onSortByChange($event)" [ngModel]="reviewsViewModel().filters.sortBy" class="sm:w-56" />
      </div>

      @if (reviewsViewModel().isLoading && !reviewsViewModel().hasReviews) {
        <div class="flex justify-center items-center py-12"><royal-code-ui-spinner size="xl" /></div>
      } @else if (reviewsViewModel().error) {
        <div class="bg-destructive/10 text-destructive border border-destructive rounded-md p-4 text-center">
          <royal-code-ui-paragraph>{{ 'common.errorOccurred' | translate }}: {{ reviewsViewModel().error?.message }}</royal-code-ui-paragraph>
        </div>
      } @else if (reviewsViewModel().hasReviews) {
        <div class="space-y-6">
          @for (review of reviewsViewModel().reviews; track review.id) {
            <plushie-royal-code-review-card
              [review]="review"
              [canEdit]="true"
              [canDelete]="true"
              [showProductTitleLink]="true"
              (edit)="onEditReview(review)"
              (delete)="onDeleteReview(review.id)"
              (vote)="onVoteReview(review.id, $event)"
            />
          }
        </div>
        <royal-code-ui-pagination
          [totalItems]="reviewsViewModel().totalCount"
          [currentPage]="reviewsViewModel().filters.pageNumber ?? 1"
          [pageSize]="reviewsViewModel().filters.pageSize ?? 10"
          (goToPage)="onGoToPage($event)"
          (pageSizeChanged)="onPageSizeChange($event)"
          [showPageSizeSelector]="true"
        />
      } @else {
        <div class="flex justify-center items-center py-12 text-secondary">
          <royal-code-ui-paragraph>{{ 'account.myReviews.noReviewsYet' | translate }}</royal-code-ui-paragraph>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProductReviewsPageComponent implements OnInit {
  protected readonly TitleTypeEnum = TitleTypeEnum;
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly notificationService = inject(NotificationService);
  private readonly reviewsFacade = inject(ReviewsFacade);
  private readonly translateService = inject(TranslateService);

  readonly reviewsViewModel = this.reviewsFacade.reviewListViewModel;

  readonly sortOptions = computed<SelectOption[]>(() => [
    { value: 'newest', label: this.translateService.instant('account.myReviews.sortOptions.newest') },
    { value: 'oldest', label: this.translateService.instant('account.myReviews.sortOptions.oldest') },
    { value: 'highestRated', label: this.translateService.instant('account.myReviews.sortOptions.highestRated') },
    { value: 'lowestRated', label: this.translateService.instant('account.myReviews.sortOptions.lowestRated') },
    { value: 'mostHelpful', label: this.translateService.instant('account.myReviews.sortOptions.mostHelpful') },
  ]);

  ngOnInit(): void {
    this.reviewsFacade.loadMyReviews();
  }

  onSortByChange(sortBy: ReviewSortBy): void { this.reviewsFacade.updateFilters({ sortBy, pageNumber: 1 }); }
  onGoToPage(pageNumber: number): void { this.reviewsFacade.updateFilters({ pageNumber }); }
  onPageSizeChange(pageSize: number): void { this.reviewsFacade.updateFilters({ pageSize, pageNumber: 1 }); }

  onEditReview(review: ReviewWithUIState): void {
    if (!review.targetEntityId) {
      this.notificationService.showError('Kan review niet bewerken: productinformatie ontbreekt in de API-response.');
      return;
    }
    this.overlayService.open({
      component: CreateReviewFormComponent,
      data: {
        targetEntityId: review.targetEntityId, targetEntityType: ReviewTargetEntityType.PRODUCT,
        existingReview: review,
        context: {
          productName: review.productName, productImageUrl: review.productImageUrl,
          authorDisplayName: review.profile?.displayName, authorAvatarMediaId: review.profile?.avatar?.id,
        }
      },
      panelClass: ['w-full', 'max-w-xl', 'bg-background'], backdropType: 'dark', mobileFullscreen: true
    }).afterClosed$.subscribe((payload: UpdateReviewPayload | null) => {
      if (payload) {
        this.reviewsFacade.updateReview(review.id, payload);
      }
    });
  }

  onDeleteReview(reviewId: string): void {
    this.notificationService.showConfirmationDialog({
      titleKey: 'reviews.deleteReview.title', messageKey: 'reviews.deleteReview.message',
      confirmButtonKey: 'common.buttons.delete', cancelButtonKey: 'common.buttons.cancel', confirmButtonType: 'theme-fire',
    }).subscribe(confirmed => {
      if (confirmed) {
        this.reviewsFacade.deleteReview(reviewId);
      }
    });
  }

  onVoteReview(reviewId: string, voteType: ReviewVoteType): void {
    this.reviewsFacade.vote(reviewId, voteType);
  }
}