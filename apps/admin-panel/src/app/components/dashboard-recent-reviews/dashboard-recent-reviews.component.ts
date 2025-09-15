/**
 * @file dashboard-recent-reviews.component.ts
 * @Version 1.1.0 (Mapped to ReviewListItemDto)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Component to display recent reviews needing moderation, now mapped to the domain model.
 */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiRatingComponent } from '@royal-code/ui/rating';
import { ReviewListItemDto } from '@royal-code/features/reviews/domain'; // Import domain model
import { DateTimeInfo } from '@royal-code/shared/base-models';

// NOTE: De RecentReview interface is verwijderd omdat we direct de ReviewListItemDto gebruiken.

@Component({
  selector: 'admin-dashboard-recent-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, UiTitleComponent, UiButtonComponent, UiRatingComponent],
  template: `
    <div class="bg-card border border-border rounded-xs shadow-sm h-full flex flex-col">
      <header class="p-4 border-b border-border flex justify-between items-center">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" text="Nieuwe Reviews" />
        <royal-code-ui-button type="outline" sizeVariant="sm" routerLink="/reviews">
          Beheer Reviews
        </royal-code-ui-button>
      </header>
      <div class="flex-grow p-4 space-y-4 overflow-y-auto">
        @for(review of reviews(); track review.id) {
          <div class="group">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-foreground">{{ review.authorDisplayName }}</p>
                @if(review.productName) {
                  <p class="text-xs text-secondary">voor {{ review.productName }}</p>
                }
              </div>
              <royal-code-ui-rating [rating]="review.rating * 2" [readonly]="true" size="sm"/>
            </div>
            <p class="text-sm text-muted mt-2 line-clamp-2 italic">"{{ review.reviewText }}"</p>
            <div class="mt-2 flex items-center gap-2">
               <royal-code-ui-button type="primary" sizeVariant="sm">Goedkeuren</royal-code-ui-button>
               <royal-code-ui-button type="outline" sizeVariant="sm">Afwijzen</royal-code-ui-button>
            </div>
          </div>
        } @empty {
          <p class="text-sm text-muted text-center pt-8">Geen nieuwe reviews.</p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardRecentReviewsComponent {
  reviews = input.required<readonly ReviewListItemDto[]>(); // << DE FIX: readonly ReviewListItemDto[]
  protected readonly TitleTypeEnum = TitleTypeEnum;
}