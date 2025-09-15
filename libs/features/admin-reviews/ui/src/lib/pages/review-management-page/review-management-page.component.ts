/**
 * @file review-management-page.component.ts
 * @Version 2.0.0 (UI Implemented)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Smart component for managing all reviews. Now displays a filter and a list of reviews.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { AdminReviewsFacade } from '@royal-code/features/admin-reviews/core';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { AdminReviewListComponent } from '../../components/admin-review-list/admin-review-list.component';
import { AdminReviewFilterComponent } from '../../components/admin-review-filter/admin-review-filter.component';
import { UiPaginationComponent } from '@royal-code/ui/pagination';
import { ReviewFilters } from '@royal-code/features/reviews/domain';

@Component({
  selector: 'admin-review-management-page',
  standalone: true,
  imports: [
    CommonModule, UiTitleComponent, UiSpinnerComponent,
    AdminReviewListComponent, AdminReviewFilterComponent, UiPaginationComponent
  ],
  template: `
    <div class="space-y-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H1" text="Review Moderation" />
      
      <admin-review-filter (filtersChanged)="onFiltersChanged($event)" />

      @if (facade.viewModel().isLoading && facade.viewModel().reviews.length === 0) {
        <div class="flex justify-center items-center h-64">
          <royal-code-ui-spinner size="lg" />
        </div>
      } @else if(facade.viewModel().error; as error) {
        <div class="p-4 bg-destructive/10 text-destructive border border-destructive rounded-xs">
          <p class="font-bold">Error Loading Reviews</p>
          <pre>{{ error | json }}</pre>
        </div>
      } @else {
        <admin-review-list
          [reviews]="facade.viewModel().reviews"
          (deleteClicked)="onDeleteReview($event)"
        />
        <royal-code-ui-pagination
          [totalItems]="facade.viewModel().totalCount"
          [currentPage]="facade.viewModel().filters.pageNumber ?? 1"
          [pageSize]="facade.viewModel().filters.pageSize ?? 20"
          (goToPage)="onPageChange($event)"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewManagementPageComponent implements OnInit {
  protected readonly facade = inject(AdminReviewsFacade);
  protected readonly TitleTypeEnum = TitleTypeEnum;

  ngOnInit(): void {
    this.facade.initPage();
  }

  onFiltersChanged(filters: Partial<ReviewFilters>): void {
    // Dit zal de effect chain triggeren om nieuwe reviews te laden
    this.facade.initPage(); // Eenvoudige manier om filters opnieuw toe te passen en de pagina te initialiseren
  }

  onPageChange(page: number): void {
    this.facade.initPage(); // Eenvoudige manier om filters opnieuw toe te passen en de pagina te initialiseren
  }

  onDeleteReview(id: string): void {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      this.facade.deleteReview(id);
    }
  }
}