/**
 * @file ui-review-card.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-12
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-06-12
 * @PromptSummary "Generate the foundational ui-review-card component as a flexible shell using ng-content for maximum reusability across different apps."
 * @Description The foundational, presentational UI component for displaying a single review.
 *              This component is designed as a flexible "shell" using <ng-content> with selectors.
 *              It provides the basic card structure, input for the Review object, and outputs for user
 *              interactions, but delegates the actual rendering of the header, body, and actions to the
 *              consuming component. This pattern allows different applications (e.g., Plushie Paradise, Challenger)
 *              to provide their own unique templates (skins) without duplicating the core logic, adhering
 *              to the DRY and Open/Closed principles.
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Review } from '@royal-code/features/reviews/domain';
import { UiCardComponent } from '@royal-code/ui/cards/card';

@Component({
  selector: 'royal-code-ui-review-card',
  standalone: true,
  imports: [
    UiCardComponent
],
  template: `
    <royal-code-ui-card>
      <div class="review-header">
        <ng-content select="[reviewHeader]"></ng-content>
      </div>

      <div class="review-body mt-4">
        <ng-content select="[reviewBody]"></ng-content>
      </div>

      <div class="review-actions mt-4">
        <ng-content select="[reviewActions]"></ng-content>
      </div>
    </royal-code-ui-card>
  `,
  styles: `
:host {
  display: block;
}

.review-header,
.review-actions {
}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiReviewCardComponent {
  /**
   * @description The full Review data object to be displayed within the card.
   *              This is a required input as the component cannot function without it.
   */
  review = input.required<Review>();

  /**
   * @description Emits the review ID when the user clicks an action to vote the review as helpful.
   *              The consuming component is responsible for handling the logic.
   */
  voteClicked = output<string>();

  /**
   * @description Emits the review ID when the user clicks an action to reply to the review.
   */
  replyClicked = output<string>();

  /**
   * @description Emits the author's profile ID when the user clicks on the author's name or avatar.
   */
  profileClicked = output<string>();

  /**
   * @description Computed signal that provides a human-readable, relative date string.
   *              Example: "2 days ago". This logic is centralized here for consistency.
   *              Note: For full i18n relative time, a library like `date-fns` would be used.
   *              For now, we use a simpler approach.
   */
  readonly relativeTime = computed(() => {
    const reviewDate = this.review()?.createdAt;
    if (!reviewDate) {
      return '';
    }
    // This is a simplified implementation. A real app would use a more robust library.
    const seconds = Math.floor((+new Date() - +reviewDate) / 1000);
    if (seconds < 29) return 'Just now';
    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };
    for (const i in intervals) {
      const counter = Math.floor(seconds / intervals[i]);
      if (counter > 0) return `${counter} ${i}${counter === 1 ? '' : 's'} ago`;
    }
    return '';
  });

  /**
   * @description Handler for the helpful button click, emitting the event upwards.
   */
  onVote(): void {
    this.voteClicked.emit(this.review().id);
  }

  /**
   * @description Handler for the reply button click, emitting the event upwards.
   */
  onReply(): void {
    this.replyClicked.emit(this.review().id);
  }

  /**
   * @description Handler for clicks on the author, emitting the event upwards.
   */
  onAuthorClick(): void {
    this.profileClicked.emit(this.review().profile.id);
  }
}
