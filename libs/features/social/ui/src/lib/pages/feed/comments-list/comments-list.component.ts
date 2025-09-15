/**
 * @file comments-list.component.ts
 * @version 1.2.0 (Added "Load More" functionality)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-01
 * @description
 *   Displays a list of replies, initially showing a limited number with a "Load More"
 *   option to reveal the rest. The initial count is configurable via an input.
 */
import {
  Component, ChangeDetectionStrategy, inject, input, computed, DestroyRef,
  Signal, OnInit, effect, AfterViewInit, Injector, afterNextRender, signal,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedReply } from '@royal-code/features/social/domain';
import { Image, Media, MediaType } from '@royal-code/shared/domain';
import { CommentItemComponent } from '../comment-item/comment-item.component';
import { CommentInputComponent, CommentSubmitData } from '../comment-input/comment-input.component';
import { FeedFacade } from '@royal-code/features/social/core';
import { Store, select } from '@ngrx/store';
import { selectRepliesForParentId, selectRepliesForReplyId, selectRepliesLoadingForParent, selectRepliesErrorForParent } from '@royal-code/features/social/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, distinctUntilChanged, startWith, catchError, filter, map, take, finalize } from 'rxjs/operators';
import { combineLatest, forkJoin, Observable, of, ReplaySubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerService } from '@royal-code/core/core-logging';
import { NotificationService } from '@royal-code/ui/notifications';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { PlushieMediaApiService } from '@royal-code/features/media/data-access-plushie';

@Component({
  selector: 'royal-code-comments-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, forwardRef(() => CommentItemComponent), CommentInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Loading Indicator -->
    @if (isLoading()) {
      <p class="px-3 py-1 text-sm text-secondary italic" [style.margin-left]="indentationStyle()">
        {{ 'social.feed.repliesLoading' | translate }}
      </p>
    }
    <!-- Error Message -->
    @if (error()) {
      <p class="px-3 py-1 text-sm text-error" [style.margin-left]="indentationStyle()">
        {{ 'social.feed.loadRepliesError' | translate }}
      </p>
    }

    <!-- List of Initially Visible Replies -->
    @if (renderedReplies().length > 0) {
      <div class="space-y-2 pt-2" [style.margin-left]="indentationStyle()">
        @for (reply of renderedReplies(); track reply.id) {
          <royal-code-comment-item
            [reply]="reply"
            [currentUserAvatar]="currentUserAvatar()"
            [currentIndentationLevel]="indentationLevel()"
            [mainParentItemId]="mainParentItemId()">
          </royal-code-comment-item>
        }
      </div>
    }

    <!-- "Load More" Link -->
    @if (remainingRepliesCount() > 0) {
      <div class="pt-1" [style.margin-left]="indentationStyle()">
        <button (click)="loadMoreReplies()"
                class="text-xs font-semibold text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded">
          {{ 'social.feed.loadMoreReplies' | translate: { count: remainingRepliesCount() } }}
        </button>
      </div>
    }

    <!-- Initial "No Replies" Message -->
    @if (displayedReplies().length === 0 && !shouldShowTopLevelInput() && !isLoading() && !error()) {
      <p class="px-3 py-1 text-sm text-secondary" [style.margin-left]="indentationStyle()">
        {{ (parentType() === 'item' ? 'social.feed.beFirstReply' : 'social.feed.noReplies') | translate }}
      </p>
    }

    <!-- Top-Level Reply Input -->
    @if (shouldShowTopLevelInput()) {
      <div class="mt-1 mb-2" [style.padding-left]="indentationStyle()">
        <royal-code-comment-input
          [avatar]="currentUserAvatar()" altText="Your avatar"
          [placeholder]="inputPlaceholder() | translate:{user: parentAuthorName()}"
          submitLabel="{{ 'common.buttons.submit' | translate }}"
          [showCancelButton]="true"
          (submitted)="handleAddReply($event)"
          (cancelled)="handleCancelReplyInput()">
        </royal-code-comment-input>
      </div>
    }
  `,
})
export class CommentsListComponent implements OnInit, AfterViewInit {
  // --- Inputs ---
  readonly feedId = input.required<string>();
  readonly mainParentItemId = input.required<string>();
  readonly parentId = input.required<string>();
  readonly parentType = input.required<'item' | 'reply'>();
  readonly showInput = input<boolean>(true);
  readonly currentUserAvatar = input<Image | undefined>();
  readonly indentationLevel = input<number>(0);
  readonly parentAuthorName = input<string | undefined>();
  readonly hideCommentReply = input<boolean>(false);
  /** @Input {number} The number of replies to show initially. Defaults to 3. */
  readonly initialReplyCount = input<number>(3); // <-- NIEUWE INPUT

  // --- Dependencies ---
  private readonly store = inject(Store);
  private readonly facade = inject(FeedFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly mediaService = inject(PlushieMediaApiService);
  private readonly injector = inject(Injector);

  // --- RxJS Subjects ---
  private readonly parentId$ = new ReplaySubject<string>(1);
  private readonly parentType$ = new ReplaySubject<'item' | 'reply'>(1);
  private readonly logPrefixBase = '[CommentsList]';

  // --- State Signals ---
  /** @internal Signal containing ALL replies for this parent, derived from the store. */
  readonly displayedReplies: Signal<FeedReply[]> = toSignal(
    combineLatest([this.parentId$, this.parentType$]).pipe(
      distinctUntilChanged((prev, curr) => prev[0] === curr[0] && prev[1] === curr[1]),
      switchMap(([parentId, parentType]) => {
        if (!parentId || !parentType) return of([] as FeedReply[]);
        const selector = parentType === 'item'
          ? selectRepliesForParentId(parentId)
          : selectRepliesForReplyId(parentId);
        return this.store.pipe(select(selector));
      }),
      takeUntilDestroyed(this.destroyRef)
    ), { initialValue: [] }
  );

  readonly isLoading: Signal<boolean> = toSignal(
    this.parentId$.pipe(
      switchMap(id => this.store.pipe(select(selectRepliesLoadingForParent(id)), startWith(false)))
    ), { initialValue: false }
  );

  readonly error: Signal<string | null> = toSignal(
    this.parentId$.pipe(
       switchMap(id => this.store.pipe(select(selectRepliesErrorForParent(id)), startWith(null)))
    ), { initialValue: null }
  );
  
  /** @internal Tracks the number of replies that should currently be visible. */
  private visibleRepliesCount = signal<number>(0); // <-- NIEUW SIGNAAL

  // --- Computed Signals ---
  /** @internal Computes the slice of replies that should actually be rendered in the DOM. */
  readonly renderedReplies = computed(() => this.displayedReplies().slice(0, this.visibleRepliesCount()));

  /** @internal Computes the number of hidden replies to show in the "Load More" link. */
  readonly remainingRepliesCount = computed(() => this.displayedReplies().length - this.renderedReplies().length);
  
  // ... (overige computed signals blijven hetzelfde)
  readonly inputPlaceholder = computed(() => this.parentType() === 'item' ? 'social.feed.placeholders.reply' : 'social.feed.placeholders.replyTo');
  readonly indentationStyle = computed(() => this.indentationLevel() <= 0 ? '0' : `${this.indentationLevel() * 1.5}rem`);
  readonly shouldShowTopLevelInput = computed(() => this.showInput() && !this.hideCommentReply() && this.indentationLevel() < 2);
  private readonly logPrefix = computed(() => `${this.logPrefixBase}-${this.parentId() ?? 'UNKNOWN'}`);
  
  constructor() {
    this.logger.debug(`${this.logPrefixBase} Instance created.`);
  }

  ngOnInit(): void {
    const initialParentId = this.parentId();
    const initialParentType = this.parentType();
    this.logger.info(`${this.logPrefix()} ngOnInit: Initializing with parentId: ${initialParentId}`);

    // Set the initial number of visible replies
    this.visibleRepliesCount.set(this.initialReplyCount()); // <-- INITIALISATIE

    this.parentId$.next(initialParentId);
    this.parentType$.next(initialParentType);

    afterNextRender(() => {
        effect(() => {
            const pId = this.parentId();
            const pType = this.parentType();
            this.parentId$.next(pId);
            this.parentType$.next(pType);
        }, { injector: this.injector });
    }, { injector: this.injector });
  }

  ngAfterViewInit(): void {
    this.logger.debug(`${this.logPrefix()} View Initialized. Total replies in state: ${this.displayedReplies().length}, showing: ${this.renderedReplies().length}`);
  }

  /**
   * Expands the list to show all available replies.
   */
  loadMoreReplies(): void {
    this.logger.info(`${this.logPrefix()} "Load More" clicked. Showing all ${this.displayedReplies().length} replies.`);
    this.visibleRepliesCount.set(this.displayedReplies().length);
  }
  /**
   * Handles the 'submitted' event from the `CommentInputComponent`.
   * This method orchestrates the upload of any attached media files and then
   * dispatches an action via the `FeedFacade` to add the new reply to the store and backend.
   * @param {CommentSubmitData} submitData - The data object containing the reply's text,
   *                                         optional GIF URL, and optional array of files to upload.
   */
  handleAddReply(submitData: CommentSubmitData): void {
    const currentDirectParentId = this.parentId();
    const currentFeedId = this.feedId();
    const currentMainParentId = this.mainParentItemId();
    const currentParentType = this.parentType();
    const logCtx = this.logPrefix();

    if (!currentDirectParentId || !currentFeedId || !currentMainParentId || !currentParentType) {
        this.logger.error(`${logCtx} Missing required input values for add reply. Aborting.`);
        this.notificationService.showErrorDialog('common.messages.error', 'errors.replies.cannotSubmit');
        return;
    }

    const content = submitData.text?.trim() ?? '';
    const gifUrl = submitData.gifUrl;
    const filesToUpload = submitData.files ?? [];

    if (!content && !gifUrl && filesToUpload.length === 0) {
        this.logger.warn(`${logCtx} Attempted to add an empty reply.`);
        this.notificationService.showWarning('errors.validation.requiredField');
        return;
    }

    this.logger.info(`${logCtx} Preparing reply submission. Files to upload: ${filesToUpload.length}`);
    // TODO: Implement visual upload progress indicator if desired.

    const uploadObservables$: Observable<Media>[] = filesToUpload.map((file: File) =>
      this.mediaService.uploadMediaWithProgress(file).pipe(
        filter((event: HttpEvent<Media>): event is HttpResponse<Media> => event.type === HttpEventType.Response),
        map(event => {
          const mediaData = event.body as Media;
          let isValidMedia = false;
          if (mediaData?.id && mediaData?.type) {
            if (mediaData.type === MediaType.IMAGE) {
              const image = mediaData as Image;
              isValidMedia = Array.isArray(image.variants) && image.variants.length > 0 && !!image.variants[0]?.url;
            } else {
              // Cast to MediaBase or specific types like VideoMedia to access 'url'
              isValidMedia = !!(mediaData as any).url; // Quick fix, refine if MediaBase doesn't guarantee 'url'
            }
          }

          if (isValidMedia) {
            this.logger.info(`${logCtx} File ${file.name} uploaded successfully.`, mediaData);
            return mediaData;
          } else {
            this.logger.error(`${logCtx} Invalid media data received for ${file.name}:`, event.body);
            throw new Error(`Invalid media data received for ${file.name}`);
          }
        }),
        catchError(uploadError => {
          this.logger.error(`${logCtx} Upload failed for file ${file.name}:`, uploadError);
          throw uploadError; // Propagate to forkJoin
        })
      )
    );

    const uploadsComplete$ = filesToUpload.length > 0 ? forkJoin(uploadObservables$) : of([]);

    uploadsComplete$.pipe(
      take(1),
      catchError(error => {
        this.logger.error(`${logCtx} Media upload process failed. Aborting reply submission.`, error);
        this.notificationService.showErrorDialog('common.errors.uploadFailedTitle', 'common.errors.uploadFailedMessage');
        return of(null); // Signal failure
      })
    ).subscribe(uploadedMediaArrayOrNull => {
      if (uploadedMediaArrayOrNull === null) {
        this.logger.warn(`${logCtx} Reply submission aborted due to upload failure.`);
        return;
      }
      const uploadedMediaArray = uploadedMediaArrayOrNull as Media[];
      this.logger.info(`${logCtx} Media uploads complete. Count: ${uploadedMediaArray.length}`);

      const gifUrlToSend = gifUrl ?? undefined;

      if (currentParentType === 'item') {
        // This is a reply to a top-level FeedItem.
        this.facade.addFeedReply(currentFeedId, currentMainParentId, content, undefined, uploadedMediaArray, gifUrlToSend);
      } else {
        // This is a reply to another FeedReply (nested reply).
        this.facade.addFeedReply(currentFeedId, currentMainParentId, content, currentDirectParentId, uploadedMediaArray, gifUrlToSend);
      }
      this.logger.info(`${logCtx} addFeedReply action dispatched successfully.`);
      // Input field reset is handled by CommentInputComponent itself upon successful submission.
    });
  }

  /**
   * Handles the cancellation of the reply input.
   * Currently, this component doesn't have a direct cancel button for the top-level input,
   * but `CommentInputComponent` does, which would emit its own `cancelled` event.
   * This method is a placeholder if direct cancellation from this list component is added.
   * @internal
   */
  handleCancelReplyInput(): void {
    this.logger.info(`${this.logPrefix()} Reply input cancelled by user (via child component).`);
    // No specific action needed here if the CommentInputComponent handles its own reset.
  }
}
