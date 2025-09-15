/**
 * @file product-review-summary.component.ts
 * @Version 1.2.0 (Dynamic i18n & Percentage Bar)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-15
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary User requested to use UiPercentageBar and dynamic translation keys for star ratings in the review summary component.
 * @Description
 *   A presentational component that displays a summary of product reviews. This version now
 *   uses the simpler `UiPercentageBarComponent` for the rating distribution and constructs
 *   translation keys dynamically for star labels.
 */
import { Component, ChangeDetectionStrategy, computed, input, InputSignal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiRatingComponent } from '@royal-code/ui/rating';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { ReviewSummary } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';
import { UiPercentageBarComponent } from '@royal-code/ui/meters'; // <-- AANGEPASTE IMPORT

interface RatingDistributionItem {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
  percentage: number;
}

@Component({
  selector: 'plushie-royal-code-review-summary',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, UiRatingComponent, UiParagraphComponent,
    UiTitleComponent, UiPercentageBarComponent, // <-- AANGEPASTE IMPORT
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (summary(); as reviewSummary) {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center bg-surface p-6 rounded-xs border border-border">
        <!-- Left Side: Overall Rating -->
        <div class="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-8">
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="(reviewSummary.averageRating.toPrecision(2))" extraClasses="!text-4xl !font-bold !text-primary !mb-1" />
          <royal-code-ui-rating [rating]="reviewSummary.averageRating * 2" size="lg" [readonly]="true" />
          <royal-code-ui-paragraph color="muted" size="sm" extraClasses="mt-2">
            {{ 'reviews.summary.totalReviews' | translate: { count: reviewSummary.totalReviews } }}
          </royal-code-ui-paragraph>
        </div>

        <!-- Right Side: Rating Distribution -->
        <div class="md:col-span-2 flex flex-col gap-2">
          @for (item of ratingDistribution(); track item.stars) {
            <div class="grid grid-cols-[max-content_1fr_max-content] items-center gap-3 text-sm">
              <!-- Dynamische vertaalkey voor sterren -->
              <span class="text-secondary font-medium w-20">
                {{ 'reviews.stars.' + (item.stars === 1 ? '1star' : item.stars + 'stars') | translate }}
              </span>
              <!-- Gebruik UiPercentageBarComponent -->
              <royal-code-ui-percentage-bar
                [currentValue]="item.percentage"
                [maxValue]="100"
                [showValueText]="false"
                size="sm"
                [barColorClass]="'bg-primary'"
                [trackColorClass]="'bg-surface-alt'"
              />

              <span class="text-foreground font-semibold w-12 text-right">{{ item.percentage }}%</span>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="h-40 w-full bg-muted rounded-xs animate-pulse"></div>
    }
  `,
  styles: [` :host { display: block; } `],
})
export class ProductReviewSummaryComponent {
  readonly summary: InputSignal<ReviewSummary | undefined> = input.required<ReviewSummary | undefined>();
  protected readonly TitleTypeEnum = TitleTypeEnum;

  readonly ratingDistribution: Signal<RatingDistributionItem[]> = computed(() => {
    const s = this.summary();
    if (!s || s.totalReviews === 0) return [];

    const distribution: RatingDistributionItem[] = [];
    const starLevels: (1 | 2 | 3 | 4 | 5)[] = [5, 4, 3, 2, 1];

    for (const stars of starLevels) {
      const count = s.ratingDistribution[stars] ?? 0;
      const percentage = (count / s.totalReviews) * 100;
      distribution.push({
        stars: stars,
        count: count,
        percentage: Math.round(percentage),
        // De 'barConfig' is niet meer nodig
      });
    }
    return distribution;
  });
}
