import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, ElementRef, viewChild, output } from '@angular/core'; // <-- DE FIX: 'output' geïmporteerd
import { CommonModule } from '@angular/common';

import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { PlushieReviewCardComponent } from '../review-card/review-card.component';
import { ReviewsFacade, ReviewWithUIState } from '@royal-code/features/reviews/core';
import { AuthFacade } from '@royal-code/store/auth';
import { NotificationService } from '@royal-code/ui/notifications';
import { ReviewVoteType } from '@royal-code/features/reviews/domain';

@Component({
  selector: 'plushie-royal-code-review-list',
  standalone: true,
  imports: [ CommonModule, UiParagraphComponent, UiSpinnerComponent, PlushieReviewCardComponent ],
  styles: [ `:host { display: block; width: 100%; }` ],
  template: `
    <div class="flex flex-col gap-6">
      @for (review of reviews(); track review.id) {
       <plushie-royal-code-review-card
          [review]="review"
          (vote)="onVote(review.id, $event)"
          (report)="onReport(review.id)"
          (delete)="onDelete(review.id)"
          (edit)="onEdit(review)"
          (authorClicked)="onAuthorClick($event)"
          [canDelete]="review.authorId === loggedInUserId()"
          [canEdit]="canUserEditReview(review)" />
      }
    </div>

    @if (isLoading() && reviews().length === 0) {
      <div class="flex justify-center p-8"><royal-code-ui-spinner></royal-code-ui-spinner></div>
    }
    @if (!isLoading() && !hasReviews()) {
      <div class="text-center p-8"><royal-code-ui-paragraph>No Reviews Yet</royal-code-ui-paragraph></div>
    }
    @if (error()) {
      <div class="text-center p-8"><royal-code-ui-paragraph color="error">{{ error()?.message }}</royal-code-ui-paragraph></div>
    }
    @if (hasMore() && !isLoading()) {
      <div #sentinel class="h-1"></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewListComponent implements OnDestroy {
  sentinel = viewChild<ElementRef>('sentinel');
  private readonly reviewsFacade = inject(ReviewsFacade);
  private readonly authFacade = inject(AuthFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly EDIT_WINDOW_MILLISECONDS = 2 * 60 * 60 * 1000;

  readonly reviews = this.reviewsFacade.allReviews;
  readonly isLoading = this.reviewsFacade.isLoading;
  readonly error = this.reviewsFacade.error;
  readonly hasMore = this.reviewsFacade.hasMore;
  readonly hasReviews = this.reviewsFacade.hasReviews;
  readonly loggedInUserId = this.authFacade.currentUserId;

  private observer?: IntersectionObserver;

  // <-- DE FIX: Output toegevoegd voor de edit event
  readonly editReviewRequested = output<ReviewWithUIState>();

  constructor() {
    effect(() => {
      const sentinelEl = this.sentinel()?.nativeElement;
      this.observer?.disconnect();
      if (sentinelEl) { this.setupObserver(sentinelEl); }
    });
  }

  private setupObserver(element: HTMLElement): void {
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !this.isLoading()) { this.reviewsFacade.loadNextPage(); }
    }, { rootMargin: '200px' });
    this.observer.observe(element);
  }

  canUserEditReview(review: ReviewWithUIState): boolean {
    const isAuthor = review.authorId === this.loggedInUserId();
    if (!review.createdAt?.timestamp) return isAuthor;
    const createdWithinEditWindow = (Date.now() - review.createdAt.timestamp) < this.EDIT_WINDOW_MILLISECONDS;
    return isAuthor && createdWithinEditWindow;
  }

  // <-- DE FIX: onEdit methode emitteert de review
  onEdit(review: ReviewWithUIState): void {
    this.editReviewRequested.emit(review);
  }
  onVote(reviewId: string, voteType: ReviewVoteType): void { this.reviewsFacade.vote(reviewId, voteType); }
  onDelete(reviewId: string): void { this.reviewsFacade.deleteReview(reviewId); }
  onReport(reviewId: string): void { console.log('Report review:', reviewId); }
  onAuthorClick(authorId: string): void { console.log('Author clicked:', authorId); }
  
  ngOnDestroy(): void { this.observer?.disconnect(); }
}