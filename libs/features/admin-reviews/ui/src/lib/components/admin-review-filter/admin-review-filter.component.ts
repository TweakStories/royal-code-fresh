/**
 * @file admin-review-filter.component.ts
 * @Version 1.1.0 (Status Filter & Effect-based Emit)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Dumb component for filtering admin review list, now including status filter and using an effect to emit changes.
 */
import { Component, ChangeDetectionStrategy, input, output, signal, effect } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewFilters, ReviewStatus } from '@royal-code/features/reviews/domain';
import { UiInputComponent } from '@royal-code/ui/input';
import { AppIcon } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'admin-review-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe, UiInputComponent, TranslateModule],
  template: `
    <div class="flex flex-col sm:flex-row gap-4 p-4 bg-surface-alt border border-border rounded-xs">
      <royal-code-ui-input
        [(ngModel)]="searchTerm"
        [placeholder]="'admin.reviews.filter.searchPlaceholder' | translate"
        [icon]="AppIcon.Search" iconPosition="left" extraClasses="flex-grow"
        (ngModelChange)="onSearchTermChange()"
      />
      <select [(ngModel)]="statusFilter"
        class="w-full sm:w-48 p-2 border border-input rounded-md bg-background text-sm focus:ring-primary focus:border-primary"
        (ngModelChange)="onStatusFilterChange()"
      >
        <option value="">{{ 'admin.reviews.filter.allStatuses' | translate }}</option>
        @for (status of reviewStatuses; track status) {
          <option [value]="status">{{ status | titlecase }}</option>
        }
      </select>
      <select [(ngModel)]="sortByFilter"
        class="w-full sm:w-48 p-2 border border-input rounded-md bg-background text-sm focus:ring-primary focus:border-primary"
        (ngModelChange)="onSortByFilterChange()"
      >
        <option value="newest">{{ 'admin.reviews.filter.sortByNewest' | translate }}</option>
        <option value="oldest">{{ 'admin.reviews.filter.sortByOldest' | translate }}</option>
        <option value="highestRated">{{ 'admin.reviews.filter.sortByHighest' | translate }}</option>
        <option value="lowestRated">{{ 'admin.reviews.filter.sortByLowest' | translate }}</option>
        <option value="mostHelpful">{{ 'admin.reviews.filter.sortByMostHelpful' | translate }}</option>
      </select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReviewFilterComponent {
  filtersChanged = output<Partial<ReviewFilters>>();

  protected readonly AppIcon = AppIcon;
  protected searchTerm: string = '';
  protected statusFilter: string = '';
  protected sortByFilter: string = 'newest';
  protected readonly reviewStatuses = Object.values(ReviewStatus);

  private initialLoadComplete = false; // Vlag om directe trigger bij initialisatie te voorkomen

  constructor() {
    effect(() => {
      // Voorkom directe trigger bij initialisatie door een guard
      if (!this.initialLoadComplete) {
        this.initialLoadComplete = true; // Markeer als compleet na de eerste run
        return;
      }

      this.filtersChanged.emit({
        searchTerm: this.searchTerm || undefined,
        status: this.statusFilter as ReviewStatus || undefined,
        sortBy: this.sortByFilter as any,
      });
    }, { allowSignalWrites: true }); // Staat toe om signalen in het effect te updaten
  }

  // De onSearchTermChange, onStatusFilterChange en onSortByFilterChange methoden hoeven geen
  // `this.filtersChanged.emit()` meer aan te roepen, omdat het effect dit nu doet.
  onSearchTermChange(): void {
    // Dit zal het effect triggeren
  }

  onStatusFilterChange(): void {
    // Dit zal het effect triggeren
  }

  onSortByFilterChange(): void {
    // Dit zal het effect triggeren
  }
}