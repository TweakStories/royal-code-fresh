/**
 * @file feed.component.ts
 * @Version 3.5.0 (Syntax Fixes & Comment Compliance)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-01
 * @Description
 *   Container component for the social feed, displaying posts and handling
 *   user interactions like posting, reacting, replying, and infinite scrolling.
 *   Implements a transparent feed design with distinct reply bubbles.
 */
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule, TitleCasePipe, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, filter, finalize, map, shareReplay, take } from 'rxjs/operators';

// === DOMAIN MODELS ===
// FIX: Correcte imports van AppIcon en PrivacyLevel uit shared/domain
import { AppIcon, PrivacyLevel, ReactionSummary, ReactionType } from '@royal-code/shared/domain';
import { Media, MediaType, Image } from '@royal-code/shared/domain';

// === UI COMPONENTS & DIRECTIVES ===
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { MediaViewerService, UiMediaCollectionComponent } from '@royal-code/ui/media'; // << Correcte import van RoyalCodeUiMediaCollectionComponent
import { ReactionPickerTriggerDirective } from '../../directives/reaction-picker-trigger.directive';
import { CommentsListComponent } from './comments-list/comments-list.component';
import { FeedPostSubmitData, FeedInputComponent } from './feed-input/feed-input.component';
import { FeedHeaderComponent } from './feed-header/feed-header.component';

// === CORE & STATE MANAGEMENT ===
// FIX: Correcte import van HttpEventType
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { LoggerService } from '@royal-code/core/core-logging';
import { PlushieMediaApiService } from '@royal-code/features/media/data-access-plushie';
import { UserFacade } from '@royal-code/store/user';
import { NotificationService } from '@royal-code/ui/notifications';
import { FeedFacade } from '@royal-code/features/social/core';
import { FeedItem } from '@royal-code/features/social/domain';

@Component({
  selector: 'royal-code-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, TranslateModule, TitleCasePipe,
    UiButtonComponent, UiIconComponent,
    CommentsListComponent,
    ReactionPickerTriggerDirective,
    FeedInputComponent,
    UiMediaCollectionComponent,
    FeedHeaderComponent
  ],
  template: `
    <div class="w-full md:max-w-xl md:mx-auto pb-16 md:pb-4 md:px-4">
      <!-- === Feed Input Section === -->
      @if (!hideFeedReply()) {
        <div class="mb-4 md:mb-6">
          @if (currentUserAvatarSignal(); as avatar) {
            <royal-code-feed-input
              [currentUserAvatar]="avatar || undefined"
              (postSubmitted)="handlePostSubmitted($event)">
            </royal-code-feed-input>
          }
        </div>
      }

      <!-- === Initial Loading / Error / Empty State Display === -->
      @if (loading() && feedItems().length === 0) {
        <div class="text-center my-4 text-secondary italic">{{ 'social.feed.loading' | translate }}</div>
      } @else {
          <!-- --- Error Message Display --- -->
          @if (error(); as errorMsg) {
            <div class="text-center my-4 text-destructive p-3 bg-destructive/10 rounded-md">
              {{ 'social.feed.loadError' | translate }}: {{ errorMsg }}
            </div>
          }

          <!-- === List of Feed Items === -->
          <div class="space-y-4 md:space-y-6">
            @for (item of feedItems(); track item.id) {
              <!-- --- Single Feed Item Container --- -->
              <div class="bg-card rounded-xs shadow-sm">
                <!-- Feed Item Header: Author, Timestamp, Privacy, Actions -->
                <royal-code-feed-header
                  [profile]="item.author"
                  [createdAt]="item.createdAt?.iso ?? ''"
                  [privacy]="item.privacy"
                  (editClicked)="editItem(item)"
                  (deleteClicked)="deleteItem(item)">
                </royal-code-feed-header>

                <!-- Feed Item Text Content -->
                <div class="px-3 md:px-4">
                  @if(item.text) {
                    <p class="break-words whitespace-pre-wrap text-sm md:text-base text-foreground">{{ item.text }}</p>
                  }
                </div>

                <!-- Feed Item Media (GIF or Image Collection) -->
                @if(item.gifUrl) {
                  <div class="px-3 md:px-4 pt-2">
                    <div class="mt-2 rounded-xs overflow-hidden max-w-sm border border-border">
                      <img [src]="item.gifUrl" alt="Attached GIF" class="w-full object-contain">
                    </div>
                  </div>
                } @else if (item.media && item.media.length > 0) {
                  <div class="px-3 md:px-4 pt-2">
                    <div
                      class="mt-2 rounded-xs overflow-hidden cursor-pointer"
                      (click)="openMedia(item.media!, 0, $event)"
                      (keydown.enter)="openMedia(item.media!, 0, $event)"
                      (keydown.space)="$event.preventDefault(); openMedia(item.media!, 0, $event)"
                      tabindex="0" role="button" [attr.aria-label]="'social.feed.aria.openMediaGrid' | translate">
                      <royal-code-ui-media-collection [media]="item.media" [containerHeight]="(gridHeight$ | async) ?? 'auto'"  />
                    </div>
                  </div>
                }

                <!-- Feed Item Actions (Reactions, Reply, Share) -->
                <div class="px-3 md:px-4 pb-1">
                  <!-- --- Reaction Summary Bubble --- -->
                  @if (item.reactions && item.reactions.length > 0) {
                    <div class="mb-2 flex items-center">
                      <div class="reaction-summary-feed group/summary inline-flex items-center gap-1 cursor-pointer rounded-full border border-primary/50 bg-background-secondary px-2 py-1 hover:border-primary h-6 md:h-7 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                           [title]="getReactionTooltip(item.reactions)"
                           (click)="openReactionListModal(item)"
                           (keydown.enter)="openReactionListModal(item)"
                           (keydown.space)="$event.preventDefault(); openReactionListModal(item)"
                           tabindex="0" role="button" [attr.aria-label]="'social.feed.aria.viewReactors' | translate">
                        <div class="flex items-center">
                            @for(reactionSummary of getTopReactions(item.reactions, 3); track reactionSummary.type; let i = $index) {
                              <royal-code-ui-icon [icon]="getAppIcon(reactionSummary.type)" sizeVariant="sm" colorClass="text-primary" strokeWidth="2" class="relative block" [style.margin-left]="i === 0 ? '0' : '-0.4rem'" [style.z-index]="3 - i" />
                            }
                        </div>
                        @if (getTotalReactionCount(item.reactions) > 0) {
                          <span class="text-xs font-medium text-primary ml-1">{{ getTotalReactionCount(item.reactions) }}</span>
                        }
                      </div>
                    </div>
                  }

                  <hr class="my-2 border-border">

                  <!-- --- Action Buttons Row (Like, Reply, Share) --- -->
                  <div class="flex items-center justify-between mt-1 text-xs md:text-sm">
                    <!-- Like/React Button -->
                    <royal-code-ui-button
                      type="transparent"
                      sizeVariant="sm"
                      extraClasses="flex-1 justify-center hover:text-primary h-10 px-4 text-sm md:h-9 md:px-3"
                      libRoyalCodeReactionPickerTrigger
                      [currentUserReaction]="item.userReaction"
                      (reactionSelected)="handleFeedItemReaction(item, $event)"
                      [ngClass]="{'!text-primary font-bold': !!item.userReaction}"
                      [attr.aria-label]="'social.feed.aria.react' | translate">
                      <royal-code-ui-icon
                        [icon]="item.userReaction ? getAppIcon(item.userReaction) : AppIcon.ThumbsUp"
                        sizeVariant="md"
                        extraClass="mr-1.5 md:h-4 md:w-4"
                        [colorClass]="item.userReaction ? 'text-primary' : 'text-muted-foreground'" />
                      <span class="ml-1 hidden sm:inline" [ngClass]="item.userReaction ? 'text-primary' : 'text-muted-foreground'">
                        {{ (item.userReaction || ('social.feed.actions.like' | translate)) | titlecase }}
                      </span>
                    </royal-code-ui-button>

                    <!-- Reply Button -->
                    <royal-code-ui-button
                      type="transparent"
                      sizeVariant="sm"
                      extraClasses="flex-1 justify-center text-muted-foreground hover:text-primary h-10 px-4 text-sm md:h-9 md:px-3"
                      (clicked)="openReply(item)">
                      <royal-code-ui-icon
                          [icon]="AppIcon.MessageSquare"
                          sizeVariant="md"
                          extraClass="mr-1.5 md:h-4 md:w-4"
                          colorClass="text-muted-foreground" />
                      <span class="ml-1 text-muted-foreground hidden sm:inline">{{ 'social.feed.actions.reply' | translate }} ({{ item.replyCount }})</span>
                    </royal-code-ui-button>

                    <!-- Share Button -->
                    <royal-code-ui-button
                      type="transparent"
                      sizeVariant="sm"
                      extraClasses="flex-1 justify-center text-muted-foreground hover:text-primary h-10 px-4 text-sm md:h-9 md:px-3"
                      (clicked)="shareItem(item)">
                      <royal-code-ui-icon
                          [icon]="AppIcon.Share"
                          sizeVariant="md"
                          extraClass="mr-1.5 md:h-4 md:w-4"
                          colorClass="text-muted-foreground" />
                      <span class="ml-1 text-muted-foreground hidden sm:inline">{{ 'common.buttons.share' | translate }}</span>
                    </royal-code-ui-button>
                  </div>
                </div>

                <!-- === Nested Reply Section (conditionally shown when a user clicks reply) === -->
                @if (replyingItemId() === item.id) {
                  <div class="px-3 md:px-4 pb-3 space-y-2">
                    <royal-code-comments-list
                        [feedId]="feedId()"
                        [mainParentItemId]="item.id"
                        [parentId]="item.id"
                        parentType="item"
                        [currentUserAvatar]="currentUserAvatarSignal() || undefined"
                        [parentAuthorName]="item.author.displayName"
                        [showInput]="true"
                        [indentationLevel]="0"
                        [hideCommentReply]="hideCommentReply()" />
                  </div>
                }
              </div>
            } @empty {
              <!-- Message displayed if no feed items are available -->
              <p class="text-center my-8 text-secondary italic">{{ 'social.feed.noItems' | translate }}</p>
            }
          </div>
      }

      <!-- === Scroll Anchor for Infinite Scrolling === -->
      <div #scrollAnchor class="h-px"></div>

      <!-- === Loading More Items Indicator === -->
      @if (loading() && feedItems().length > 0) {
        <div class="text-center my-4 text-secondary italic">{{ 'social.feed.loadingMore' | translate }}</div>
      }
    </div>
  `,
})
export class FeedComponent implements OnInit, AfterViewInit, OnDestroy {
  // === COMPONENT PROPERTIES ===
  // --- Inputs ---
  readonly feedId = input.required<string>();
  readonly hideFeedReply = input<boolean>(false);
  readonly hideCommentReply = input<boolean>(false);
  readonly maximumNumberOfFeedItems = input<number>(0);

  // --- Dependencies ---
  private readonly feedFacade = inject(FeedFacade);
  private readonly logger = inject(LoggerService);
  private readonly userFacade = inject(UserFacade);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mediaViewerService = inject(MediaViewerService);
  private readonly notificationService = inject(NotificationService);
  private readonly mediaService = inject(PlushieMediaApiService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // --- State Signals ---
  readonly feedItems = toSignal(this.feedFacade.feedItems$, { initialValue: [] });
  readonly loading = toSignal(this.feedFacade.loading$, { initialValue: true });
  readonly error = toSignal(this.feedFacade.error$, { initialValue: null });
  readonly currentUserAvatarSignal = toSignal(this.userFacade.avatar$);
  readonly replyingItemId = signal<string | null>(null);
  readonly isUploading = signal(false);
  protected readonly AppIcon = AppIcon; 

  // --- View Childs ---
  readonly scrollAnchor = viewChild.required<ElementRef<HTMLDivElement>>('scrollAnchor');

  // --- Computed Signals ---
  readonly isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(map(result => result.matches), shareReplay());
  readonly gridHeight$ = this.isHandset$.pipe(map(isHandset => isHandset ? '12rem' : '20rem'));

  // --- Private Properties ---
  private observer: IntersectionObserver | null = null;
  private readonly logPrefix = '[FeedComponent]';
  private readonly platformId: Object; 

  // === CONSTRUCTOR ===
  constructor() {
    this.platformId = inject(PLATFORM_ID); 
    this.logger.debug(`${this.logPrefix} Initialized.`);
  }

  // === LIFECYCLE HOOKS ===
  ngOnInit(): void {
    // Initial Feed Load
    const currentFeedId = this.feedId();
    if (currentFeedId) {
      this.logger.info(`${this.logPrefix} Initializing and loading feed: ${currentFeedId} with max items: ${this.maximumNumberOfFeedItems()}`);
      this.feedFacade.loadFeed(currentFeedId, undefined, undefined, this.maximumNumberOfFeedItems() || undefined);
    } else {
      this.logger.error(`${this.logPrefix} Initialization failed: feedId input is missing!`);
    }
  }

  ngAfterViewInit(): void {
    // Infinite Scroll Setup
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    // Cleanup
    this.disconnectIntersectionObserver();
  }

  // === PUBLIC EVENT HANDLERS ===
  public handlePostSubmitted(data: FeedPostSubmitData): void {
    // Post Submission Logic
    const currentFeedId = this.feedId();
    const logCtx = `${this.logPrefix} [handlePostSubmitted]`;

    this.logger.info(`${logCtx} Received post data:`, { textLength: data.text?.length, hasGif: !!data.gifUrl, fileCount: data.files?.length ?? 0 });
    if (!currentFeedId) {
      this.logger.error(`${logCtx} Aborting submission: feedId is missing.`);
      this.notificationService.showError('error.feed.post.missingFeedId');
      return;
    }

    const trimmedContent = data.text.trim();
    const gifUrl = data.gifUrl;
    const filesToUpload = data.files ?? [];

    if (!trimmedContent && !gifUrl && filesToUpload.length === 0) {
      this.logger.warn(`${logCtx} Aborting submission: Attempted to submit an empty post.`);
      this.notificationService.showWarning('error.feed.post.emptyContent');
      return;
    }

    this.isUploading.set(true);
    this.logger.info(`${logCtx} Data validated. Starting submission process. Files to upload: ${filesToUpload.length}`);

    const uploadObservables$: Observable<Media>[] = filesToUpload.map((file: File) => {
      this.logger.debug(`${logCtx} Creating upload observable for file: ${file.name}`);
      return this.mediaService.uploadMediaWithProgress(file).pipe(
        filter((event: HttpEvent<any>): event is HttpResponse<any> => event.type === HttpEventType.Response),
        map(event => {
          const mediaData = event.body as Media;
          let isValidMedia = false;

          if (mediaData?.id && mediaData?.type) {
            if (mediaData.type === MediaType.IMAGE) {
              const image = mediaData as Image;
              isValidMedia = Array.isArray(image.variants) && image.variants.length > 0 && !!image.variants[0]?.url;
            } else {
              isValidMedia = !!(mediaData as any).url;
            }
          }

          if (isValidMedia) {
            this.logger.info(`${logCtx} Upload successful for ${file.name}.`, mediaData);
            return mediaData;
          } else {
            this.logger.error(`${logCtx} Invalid media data received in upload response for ${file.name}:`, event.body);
            throw new Error(`Invalid media data received for ${file.name}. Type: ${mediaData?.type}, Data: ${JSON.stringify(mediaData)}`);
          }
        }),
      );
    });

    const uploadsComplete$: Observable<Media[] | null> = filesToUpload.length > 0
      ? forkJoin(uploadObservables$).pipe(
          catchError(error => {
            this.logger.error(`${logCtx} One or more file uploads failed. Aborting post submission.`, error);
            this.notificationService.showErrorDialog('common.errors.uploadFailedTitle', 'common.errors.uploadFailedMessage');
            return of(null);
          })
        )
      : of([]);

    uploadsComplete$.pipe(
      take(1),
      finalize(() => {
          this.logger.debug(`${logCtx} Upload/Submission process finalized. Resetting loading state.`);
          this.isUploading.set(false);
      })
    ).subscribe(uploadedMediaArrayOrNull => {
      if (uploadedMediaArrayOrNull === null) {
        this.logger.warn(`${logCtx} Post submission not dispatched due to upload failure.`);
        return;
      }

      const uploadedMediaArray = uploadedMediaArrayOrNull as Media[];
      this.logger.info(`${logCtx} Uploads complete. Final media array count: ${uploadedMediaArray.length}`);

      this.feedFacade.addFeedItem(
          currentFeedId,
          trimmedContent,
          uploadedMediaArray,
          gifUrl ?? undefined,
          PrivacyLevel.PUBLIC
      );

      this.logger.info(`${logCtx} addFeedItem action dispatched successfully.`);
    });
  }

  public handleFeedItemReaction(item: FeedItem, reaction: ReactionType | null): void {
    // Handle reaction for a feed item
    const reactionToSend = item.userReaction === reaction ? null : reaction;
    this.logger.info(`${this.logPrefix} Handling reaction for ITEM ${item.id}: ${reactionToSend}`);
    this.feedFacade.reactToFeedItem(this.feedId(), item.id, reactionToSend);
  }

  public openReply(item: FeedItem): void {
    // Open/close the reply section for a feed item
    const currentReplyingId = this.replyingItemId();
    const newReplyingId = currentReplyingId === item.id ? null : item.id;
    this.replyingItemId.set(newReplyingId);

    if (newReplyingId) {
      this.logger.info(`${this.logPrefix} Opening replies for item: ${newReplyingId}.`);
      this.feedFacade.getOrLoadReplies(this.feedId(), newReplyingId)
          .pipe(takeUntilDestroyed(this.destroyRef), take(1))
          .subscribe({ error: (err) => this.logger.error(`${this.logPrefix} Error ensuring replies loaded:`, err) });
    } else {
      this.logger.info(`${this.logPrefix} Closing replies for item: ${item.id}`);
    }
  }

  public openReactionListModal(item: FeedItem): void {
    // Open a modal showing users who reacted to the item (placeholder)
    this.logger.info(`${this.logPrefix} Clicked reaction summary for item ${item.id}.`);
    this.notificationService.showInfo('Reactielijst bekijken nog niet geïmplementeerd.');
  }

  public shareItem(item: FeedItem): void {
    // Share a feed item using Web Share API
    this.logger.info(`${this.logPrefix} Share clicked for item ${item.id}.`);
    if (navigator.share) {
      navigator.share({
        title: `${item.author.displayName}'s post`,
        text: item.text ? `${item.text.substring(0, 100)}...` : 'Bekijk deze post!',
        url: window.location.href
      }).then(() => {
        this.logger.info(`${this.logPrefix} Web Share successful.`);
      }).catch((error) => {
        if (error.name !== 'AbortError') this.logger.error(`${this.logPrefix} Web Share failed:`, error);
        else this.logger.info(`${this.logPrefix} Web Share cancelled.`);
      });
    } else {
      this.logger.warn(`${this.logPrefix} Web Share API not supported.`);
      this.notificationService.showInfo('Delen via browser niet ondersteund.');
    }
  }

  public editItem(item: FeedItem): void {
      // Edit a feed item (placeholder)
      this.logger.warn(`${this.logPrefix} Edit triggered for item ${item.id}. TODO: Implement.`);
      this.notificationService.showInfo('Item bewerken nog niet geïmplementeerd.');
  }

  public deleteItem(item: FeedItem): void {
      // Delete a feed item (placeholder)
      this.logger.warn(`${this.logPrefix} Delete triggered for item ${item.id}. TODO: Implement.`);
      this.notificationService.showInfo('Item verwijderen nog niet geïmplementeerd.');
  }

  public openMedia(mediaList: Media[], startIndex: number, event: Event): void {
      // Open the media lightbox
      event.stopPropagation();
      this.logger.info(`${this.logPrefix} Opening media lightbox. Start index: ${startIndex}`);
      this.mediaViewerService.openLightbox(mediaList, startIndex);
  }

  // === PRIVATE METHODS ===

  private setupIntersectionObserver(): void {
    // Set up Intersection Observer for infinite scrolling
    // Gebruik isPlatformBrowser om dit alleen op de client uit te voeren
    if (isPlatformBrowser(this.platformId)) { // << HIER TOEVOEGEN CHECK
      const scrollAnchorElement = this.scrollAnchor()?.nativeElement;
      if (scrollAnchorElement) { // `IntersectionObserver` in `window` check is niet strikt nodig bij `isPlatformBrowser`
        this.observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && !this.loading()) {
            this.logger.debug(`${this.logPrefix} Scroll anchor intersected, loading more items.`);
            this.loadMoreFeedItems();
          }
        }, { rootMargin: '200px' });
        this.observer.observe(scrollAnchorElement);
      } else {
        this.logger.warn(`${this.logPrefix} IntersectionObserver setup failed (anchor not found).`);
      }
    } else {
      this.logger.debug(`${this.logPrefix} Skipping IntersectionObserver setup on server (SSR).`); // << Log voor SSR
    }
  }


  private disconnectIntersectionObserver(): void {
    // Disconnect the Intersection Observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private loadMoreFeedItems(): void {
    // Load more feed items
    const currentFeedId = this.feedId();
    if (currentFeedId) {
      this.logger.info(`${this.logPrefix} Requesting more feed items via facade for feed: ${currentFeedId}`);
      this.feedFacade.loadMoreFeedItems(currentFeedId);
    } else {
      this.logger.error(`${this.logPrefix} Cannot load more items, feedId is missing.`);
    }
  }

  protected getAppIcon(reactionType: ReactionType | null | undefined): AppIcon {
    // Map ReactionType to AppIcon
    if (!reactionType) return AppIcon.ThumbsUp;
    switch (reactionType) {
      case ReactionType.Like: return AppIcon.ThumbsUp;
      case ReactionType.Love: return AppIcon.Heart;
      case ReactionType.Haha: return AppIcon.SmilePlus;
      case ReactionType.Wow:  return AppIcon.Sparkles;
      case ReactionType.Sad:  return AppIcon.Frown;
      case ReactionType.Angry:return AppIcon.Angry;
      default: return AppIcon.ThumbsUp;
    }
  }

  protected getTopReactions(reactions: readonly ReactionSummary[] | undefined | null, topN: number): ReactionSummary[] {
    // Get top N reactions
    if (!reactions) return [];
    return [...reactions].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, topN);
  }

  protected getTotalReactionCount(reactions: readonly ReactionSummary[] | undefined | null): number {
    // Calculate total reaction count
    return reactions?.reduce((sum, r) => sum + (r.count || 0), 0) ?? 0;
  }

  protected getReactionTooltip(reactions: readonly ReactionSummary[] | undefined | null): string {
    // Generate tooltip for reactions
    const defaultTooltip = this.translate.instant('social.feed.tooltips.react');
    if (!reactions || reactions.length === 0) return defaultTooltip;
    const tooltipText = reactions.filter(r=>(r.count||0)>0).map(r=>`${r.type}: ${r.count}`).join('\n');
    return tooltipText || defaultTooltip;
  }
}