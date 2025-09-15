/**
 * @file comment-item.component.ts
 * @Version 1.8.0 (Final UI Polish & Sorting Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-01
 * @Description
 *   Displays a single comment/reply with final UI polish: distinct background bubble,
 *   Facebook-style reply lines, and on-demand loading of deeper replies.
 *   Sorting on like is now fixed.
 */
import {
  Component, ChangeDetectionStrategy, inject, input, output, signal,
  computed, effect, ElementRef, OnDestroy, InputSignal, Injector, Signal,
  forwardRef, viewChild, afterNextRender, OutputEmitterRef
} from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Store, select } from '@ngrx/store';
import { switchMap, of, distinctUntilChanged, filter, Observable, tap, catchError, take, forkJoin, map, throwError } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReplaySubject } from 'rxjs';
import { RouterModule } from '@angular/router';

// === DOMAIN MODELS ===
import { AppIcon, ConfirmationDialogResult, ReactionSummary, ReactionType } from '@royal-code/shared/domain';
import { Media, Image, MediaType, ImageVariant } from '@royal-code/shared/domain';

// === UI COMPONENTS & DIRECTIVES ===
import { CommentInputComponent, CommentSubmitData } from '../comment-input/comment-input.component';
import { UiMediaCollectionComponent } from "@royal-code/ui/media";
import { ReactionPickerTriggerDirective } from '../../../directives/reaction-picker-trigger.directive';
import { UiButtonComponent } from '@royal-code/ui/button';
import { ConfirmationDialogData } from '@royal-code/shared/domain';
import { UiDropdownComponent } from '@royal-code/ui/dropdown';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiProfileImageComponent } from '@royal-code/ui/media';
import { NotificationService, ConfirmationDialogComponent } from '@royal-code/ui/notifications';
import { DynamicOverlayService } from '@royal-code/ui/overlay';

// === CORE & STATE MANAGEMENT ===
import { AuthFacade } from '@royal-code/store/auth';
import { FeedFacade } from '@royal-code/features/social/core';
import { LoggerService } from '@royal-code/core/core-logging';
import { PlushieMediaApiService } from '@royal-code/features/media/data-access-plushie';
import { selectRepliesForReplyId } from '@royal-code/features/social/core';

import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeedReply } from '@royal-code/features/social/domain';

@Component({
  selector: 'royal-code-comment-item',
  standalone: true,
  imports: [
    CommonModule, DatePipe, TranslateModule, TitleCasePipe, RouterModule,
    UiButtonComponent, UiIconComponent, UiDropdownComponent,
    CommentInputComponent, ReactionPickerTriggerDirective, UiProfileImageComponent,
    UiMediaCollectionComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
styles: [`
    :host {
      display: block;
      position: relative;
    }

    /* === Action Button Menu Styles === */
    .action-button-menu {
      @apply flex items-center relative cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors w-full text-left;
      @apply hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground;

      &.text-destructive {
        @apply hover:!bg-destructive hover:!text-destructive-foreground focus:!bg-destructive focus:!text-destructive-foreground;
      }
    }

    /* === Rich Text Link Styling === */
    .rich-text a {
      @apply text-primary hover:underline;
    }

    /* === REPLIES HIERARCHY LINES (Facebook Style) === */

    /* The overall container for a comment item */
    .comment-item-container {
      position: relative;
    }

    /* Container for a list of nested replies. This draws the vertical line. */
    .nested-replies {
      position: relative;
      
      /* Vertical line running alongside all replies in this list */
      &::before {
        content: '';
        position: absolute;
        top: 0;
        /* Adjust this value to align with the avatar line */
        /* Calculation: (Avatar radius + half of space-x between avatar and bubble) */
        left: calc(1.25rem + 0.25rem); /* Assuming 1.25rem is half avatar width + 0.25rem half gap */
        bottom: 0;
        width: 2px;
        background-color: var(--color-border);
        z-index: 0;
      }
    }

    /* The content-wrapper of an INDIVIDUAL reply (the bubble and header elements). */
    /* This is crucial for positioning the horizontal line relative to its avatar. */
    .comment-item-content-wrapper {
      position: relative;
      z-index: 1; /* Ensures content is above the lines */
    }

    /* The avatar container for a reply. This draws the horizontal "elbow" line. */
    .comment-avatar {
      position: relative;

      /* The horizontal "elbow" line that connects from the vertical line to the avatar */
      &::before {
        content: '';
        position: absolute;
        /* Vertical position, approximately centered with the avatar */
        top: calc(1.5rem); /* Adjust based on avatar height and desired line height */
        /* Start point to the left (negative value to extend outside the avatar's box) */
        left: calc(-1.25rem - 0.25rem); /* Must reach the vertical line */
        width: calc(1.25rem + 0.25rem); /* Length of the horizontal line, matching the vertical line's offset */
        height: 2px;
        background-color: var(--color-border);
      }
    }
  `],
  template: `
    @if (reply(); as currentReply) {
      <div class="comment-item-container">
        <!-- === Display Mode for Reply (when not editing) === -->
        @if (!isEditing()) {
          <div class="comment-item-content-wrapper flex w-full items-start space-x-2 sm:space-x-3 pb-1">
            <!-- Author Avatar Section -->
            <div class="comment-avatar flex-shrink-0 pt-1.5 sm:pt-2">
              <royal-code-ui-profile-image
                  [source]="currentReply.author.avatar"
                  [displayName]="currentReply.author.displayName || ('social.feed.unknownUser' | translate)"
                  [size]="'sm'"
                />
            </div>
            <!-- Reply Content Section (The Bubble and Actions/Media) -->
            <div class="min-w-0 flex-1 flex flex-col">
              <div class="comment-content-bubble group flex flex-col items-start space-y-1">
                <!-- Inner bubble with lighter background -->
                <div class="bg-background-secondary text-foreground rounded-xl p-2 sm:p-3">
                  <!-- Reply Header: Author Name -->
                  <a [routerLink]="['/profile', currentReply.author.id]"
                     class="cursor-pointer text-xs sm:text-sm font-semibold text-foreground hover:text-primary hover:underline transition-colors duration-150"
                     [title]="currentReply.author.displayName || ('social.feed.unknownUser' | translate)">
                    {{ currentReply.author.displayName || ('social.feed.unknownUser' | translate) }}
                  </a>
                  <!-- Reply Text Content -->
                  @if (currentReply.text) {
                    <p class="text-xs sm:text-sm leading-snug text-foreground break-words rich-text">{{ currentReply.text }}</p>
                  }
                </div>

                <!-- Reply Action Buttons & Metadata -->
                <div class="flex items-center gap-x-1 sm:gap-x-2 text-[10px] mt-0.5">
                  <span class="whitespace-nowrap text-xs text-secondary">{{ currentReply.createdAt?.iso | date:'shortTime' }}</span>

                  <royal-code-ui-button
                    type="transparent"
                    sizeVariant="xs"
                    libRoyalCodeReactionPickerTrigger
                    [currentUserReaction]="currentUserReaction()"
                    (reactionSelected)="handleCommentReaction($event)"
                    class="p-1 font-semibold"
                    [ngClass]="{'font-bold': !!currentUserReaction()}"
                    [title]="'social.feed.aria.react' | translate"
                    [attr.aria-label]="'social.feed.aria.react' | translate">
                    <span [ngClass]="likeTextColorClass()">
                        {{ (currentUserReaction() ? (currentUserReaction() | titlecase) : ('social.feed.actions.like' | translate)) }}
                    </span>
                  </royal-code-ui-button>

                  @if(canReplyToThisLevel()) {
                    <royal-code-ui-button
                      type="transparent"
                      sizeVariant="xs"
                      (clicked)="onReplyTo()"
                      [disabled]="!canReply()"
                      class="p-1 font-semibold">
                      <span class="text-secondary">{{ 'social.feed.actions.reply' | translate }}</span>
                    </royal-code-ui-button>
                  }

                  @if (currentReply.reactions && currentReply.reactions.length > 0) {
                    <div class="ml-auto">
                        <div class="reaction-summary group/summary inline-flex items-center gap-1 cursor-pointer rounded-full border border-primary/50 bg-background-secondary px-1.5 py-0.5 hover:border-primary h-6 w-fit"
                            [title]="getReactionTooltip(currentReply.reactions)"
                            (click)="openReactionListModal(currentReply)"
                            tabindex="0" role="button" [attr.aria-label]="'social.feed.aria.openReactions' | translate">
                          <div class="flex items-center">
                              @for(reactionSummary of getTopReactions(currentReply.reactions, 3); track reactionSummary.type; let i = $index) {
                                <royal-code-ui-icon [icon]="getAppIcon(reactionSummary.type)" sizeVariant="xs" colorClass="text-primary" strokeWidth="2"
                                                        [style.margin-left]="i === 0 ? '0' : '-0.3rem'" [style.z-index]="3 - i" ></royal-code-ui-icon>
                              }
                          </div>
                          @if (computedTotalReactionCount() > 0) {
                            <span class="text-[10px] sm:text-xs font-medium text-primary">{{ computedTotalReactionCount() }}</span>
                          }
                        </div>
                    </div>
                  }
                </div>

                 <!-- Reply Media (GIF or Image Collection) -->
                 @if (currentReply.gifUrl) {
                    <div class="mt-2 rounded overflow-hidden max-w-xs">
                        <img [src]="currentReply.gifUrl" [alt]="'social.feed.aria.attachedGif' | translate" class="w-full object-contain rounded border border-border">
                    </div>
                } @else if (currentReply.media?.length) {
                  <div class="mt-2 rounded-xs overflow-hidden">
                    <royal-code-ui-media-collection
                      [media]="currentReply.media"
                      layout="mosaic"
                      containerHeight="10rem"
                    />
                  </div>
                }
              </div>
            </div>
            <!-- Dropdown Menu for More Options -->
            <div class="relative ml-auto">
              <royal-code-ui-dropdown alignment="right" [offsetY]="2" triggerOn="click">
                  <button dropdown-trigger type="button"
                          class="p-1 -m-1 rounded text-secondary opacity-0 group-hover:opacity-100 focus-within:opacity-100 focus:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-hover"
                          [attr.aria-label]="'common.buttons.moreOptions' | translate">
                        <royal-code-ui-icon [icon]="AppIcon.MoreHorizontal" sizeVariant="sm"></royal-code-ui-icon>
                  </button>
                  <div dropdown>
                    <div class="w-40 rounded-md border border-border bg-popover py-1 shadow-lg text-popover-foreground">
                        @if(canEditOrDelete()) {
                          <button class="action-button-menu" (click)="startEdit()">
                            <royal-code-ui-icon [icon]="AppIcon.Edit3" sizeVariant="xs" extraClass="mr-2"></royal-code-ui-icon>
                            {{ 'common.buttons.edit' | translate }}
                          </button>
                          <button class="action-button-menu text-destructive" (click)="onDelete()">
                            <royal-code-ui-icon [icon]="AppIcon.Trash2" sizeVariant="xs" extraClass="mr-2"></royal-code-ui-icon>
                            {{ 'common.buttons.delete' | translate }}
                          </button>
                          <hr class="my-1 border-border">
                        }
                        <button class="action-button-menu" (click)="onShare()">
                          <royal-code-ui-icon [icon]="AppIcon.Share" sizeVariant="xs" extraClass="mr-2"></royal-code-ui-icon>
                          {{ 'common.buttons.share' | translate }}
                        </button>
                        <button class="action-button-menu" (click)="onReport()">
                          <royal-code-ui-icon [icon]="AppIcon.Flag" sizeVariant="xs" extraClass="mr-2"></royal-code-ui-icon>
                          {{ 'common.buttons.report' | translate }}
                        </button>
                    </div>
                  </div>
              </royal-code-ui-dropdown>
            </div>
          </div>
        } @else {
          <!-- === Edit Mode for Reply === -->
          <div class="w-full p-0">
            <royal-code-comment-input
              #editInput
              [initialText]="currentReply.text ?? undefined"
              [avatar]="currentReply.author.avatar"
              [altText]="('social.feed.avatarAlt' | translate: { name: currentReply.author.displayName || ('social.feed.unknownUser' | translate) })"
              [placeholder]="'social.feed.placeholders.editComment' | translate"
              [submitLabel]="'common.buttons.save' | translate"
              [showCancelButton]="true"
              [showAvatar]="true"
              (submitted)="submitEdit($event)"
              (cancelled)="cancelEdit()">
            </royal-code-comment-input>
          </div>
        }

        <!-- === Reply Input Section (conditionally shown to add a new reply) === -->
        @if (isReplying()) {
          <div class="mt-1 w-full pl-8 sm:pl-10 pr-2 sm:pr-3">
            <royal-code-comment-input
              #replyInput
              [avatar]="currentUserAvatar()"
              altText="{{ 'social.feed.aria.yourAvatar' | translate }}"
              [placeholder]="'social.feed.placeholders.replyTo' | translate: { user: currentReply.author.displayName || ('social.feed.unknownUser' | translate) }"
              [submitLabel]="'common.buttons.reply' | translate"
              [showCancelButton]="true"
              [showAvatar]="true"
              (submitted)="submitReply($event)"
              (cancelled)="cancelReply()">
            </royal-code-comment-input>
          </div>
        }

        <!-- === Nested Replies List Section === -->
        @if (hasHiddenReplies()) {
            <div class="mt-1 pl-8 sm:pl-10">
                <button (click)="showNestedReplies()" class="text-xs font-semibold text-primary hover:underline">
                    <royal-code-ui-icon [icon]="AppIcon.CornerDownRight" sizeVariant="xs" extraClass="inline-block mr-1"></royal-code-ui-icon>
                    {{ 'social.feed.viewMoreReplies' | translate: { count: nestedRepliesSignal().length } }}
                </button>
            </div>
        }
        @if (shouldShowNestedReplies() && currentIndentationLevel() < 2) {
          <div class="nested-replies pt-2 pl-6 sm:pl-10">
            @for (nestedReply of nestedRepliesSignal(); track nestedReply.id) {
              <royal-code-comment-item
                [reply]="nestedReply"
                [currentUserAvatar]="currentUserAvatar()"
                [currentIndentationLevel]="currentIndentationLevel() + 1"
                [mainParentItemId]="mainParentItemId()">
              </royal-code-comment-item>
            }
          </div>
        } @else if (shouldShowNestedReplies() && currentIndentationLevel() >= 2) {
          <div class="nested-replies pt-2 pl-6 sm:pl-10">
            <p class="text-xs text-secondary italic">
              {{ 'social.feed.maxNestingReached' | translate }}
            </p>
          </div>
        }
      </div>
    } @else {
      <!-- Fallback Message if Comment Data is Not Available -->
      <p class="p-3 text-sm text-error">{{ 'social.feed.commentDataNotAvailable' | translate }}</p>
    }
  `,
})
export class CommentItemComponent implements OnDestroy {
  // === COMPONENT PROPERTIES ===
  // --- Constants ---
  private readonly MAX_NESTING_LEVEL = 2;
  private readonly logPrefixBase = '[CommentItemComponent]';

  // --- Inputs ---
  readonly currentIndentationLevel = input<number>(0);
  readonly currentUserAvatar = input.required<Image | undefined>();
  readonly mainParentItemId = input.required<string>();
  readonly reply: InputSignal<FeedReply> = input.required<FeedReply>();

  // --- Dependencies ---
  private readonly authFacade = inject(AuthFacade);
  private readonly feedFacade = inject(FeedFacade);
  private readonly injector = inject(Injector);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly store = inject(Store);
  private readonly translate = inject(TranslateService);
  private readonly mediaService = inject(PlushieMediaApiService);

  // --- Internal UI State ---
  readonly isEditing = signal(false);
  readonly isReplying = signal(false);
  readonly areNestedRepliesVisible = signal<boolean>(false);
  private currentUserId = signal<string | null>(null);
  private uploadProgress = signal<number | null>(null);

  // --- Template Access ---
  protected readonly AppIcon = AppIcon;

  // --- RxJS Subject for triggering nested replies selection ---
  private readonly nestedRepliesSource$: ReplaySubject<FeedReply | null> = new ReplaySubject(1);

  // --- View Child References ---
  private readonly editInputRef = viewChild<CommentInputComponent>('editInput');
  private readonly replyInputRef = viewChild<CommentInputComponent>('replyInput');

  // --- Computed Values ---
  private readonly logPrefix = computed(() => `[CommentItem ${this.reply()?.id ?? '???'}]`);
  readonly currentReplySafe: Signal<FeedReply | null> = computed(() => this.reply() ?? null);
  readonly canEditOrDelete = computed(() => this.currentUserId() === this.reply()?.author?.id);
  readonly currentUserReaction = computed(() => this.reply()?.userReaction);
  readonly computedTotalReactionCount = computed(() => this.getTotalReactionCount(this.reply()?.reactions));
  readonly nestedRepliesSignal: Signal<FeedReply[]> = toSignal(
    this.nestedRepliesSource$.pipe(
      filter((currentReply): currentReply is FeedReply => !!currentReply),
      distinctUntilChanged((prev, curr) => prev.id === curr.id),
      switchMap(currentReply => this.store.pipe(select(selectRepliesForReplyId(currentReply.id)))),
      catchError(err => {
        this.logger.error(`${this.logPrefix()} Error selecting nested replies from store:`, err);
        return of([] as FeedReply[]);
      })
    ),
    { initialValue: [] }
  );
  readonly shouldShowNestedReplies = computed(() => this.areNestedRepliesVisible());
  readonly hasHiddenReplies = computed(() => this.nestedRepliesSignal().length > 0 && !this.areNestedRepliesVisible());
  readonly canReplyToThisLevel = computed(() => this.currentIndentationLevel() < this.MAX_NESTING_LEVEL);
  readonly canReply = computed(() => !!this.currentUserId());
  readonly likeIconColorClass: Signal<string> = computed(() => this.currentUserReaction() ? 'text-primary' : 'text-secondary');
  readonly likeTextColorClass: Signal<string> = computed(() => this.currentUserReaction() ? 'text-primary font-bold' : 'text-secondary');

  // === CONSTRUCTOR ===
  constructor() {
    this.logger.debug(`${this.logPrefixBase} Instance created.`);
    
    // --- GROEPJE CODE COMMENT ---
    // Effect om de huidige gebruikers-ID te synchroniseren vanuit de AuthFacade.
    effect(() => {
      const user = this.authFacade.currentUser();
      this.currentUserId.set(user?.id ?? null);
    }, { injector: this.injector });

    // --- GROEPJE CODE COMMENT ---
    // Effect om de `reply` input-veranderingen door te geven aan de RxJS-stroom voor geneste replies.
    effect(() => {
      this.nestedRepliesSource$.next(this.reply());
    }, { injector: this.injector });

    // --- GROEPJE CODE COMMENT ---
    // Effect om de focus te leggen op de reply- of edit-input wanneer deze zichtbaar wordt.
    effect(() => {
      if (this.isReplying()) {
        afterNextRender(() => {
            this.replyInputRef()?.focusTextarea();
        }, { injector: this.injector });
      }
      if (this.isEditing()) {
        afterNextRender(() => {
            this.editInputRef()?.focusTextarea();
        }, { injector: this.injector });
      }
    });

  }

  // === LIFECYCLE HOOKS ===
  ngOnDestroy(): void {
    // --- Cleanup ---
    this.nestedRepliesSource$.complete();
  }

  // === PUBLIC EVENT HANDLERS & METHODS ===

  public startEdit(): void {
    // --- GROEPJE CODE COMMENT ---
    // Logica om de edit-modus te activeren.
    if (this.canEditOrDelete()) {
      this.isEditing.set(true);
      this.logger.info(`${this.logPrefix()} Edit mode activated.`);
    } else {
      this.logger.warn(`${this.logPrefix()} User attempted to edit comment without permission.`);
      this.notificationService.showInfo('social.feed.editNotAllowed');
    }
  }

  public submitEdit(submitData: CommentSubmitData): void {
    // --- GROEPJE CODE COMMENT ---
    // Logica om een bewerkte reply op te slaan.
    const currentReply = this.currentReplySafe();
    if (!this.canEditOrDelete() || !currentReply) {
      this.logger.error(`${this.logPrefix()} Submit edit prevented due to missing permissions or data.`);
      this.isEditing.set(false);
      return;
    }

    const newText = submitData.text.trim();
    if (newText === (currentReply.text ?? '') && submitData.gifUrl === currentReply.gifUrl) {
      this.logger.debug(`${this.logPrefix()} Edit submitted but content was unchanged; no update dispatched.`);
      this.isEditing.set(false);
      return;
    }

    this.logger.info(`${this.logPrefix()} Submitting edited text.`);
    const now = new Date();
    const changes: Partial<FeedReply> = {
      text: newText,
      gifUrl: submitData.gifUrl ?? undefined,
      isEdited: true,
      lastModified: { iso: now.toISOString(), timestamp: now.getTime(), utcOffsetMinutes: -now.getTimezoneOffset() }
    };
    this.feedFacade.editFeedReply(currentReply.feedId, currentReply.parentId, currentReply.id, changes);
    this.isEditing.set(false);
  }

  public cancelEdit(): void {
    // --- GROEPJE CODE COMMENT ---
    // Logica om de edit-modus te annuleren.
    this.isEditing.set(false);
    this.logger.info(`${this.logPrefix()} Edit mode cancelled.`);
  }

  public onReplyTo(): void {
    // --- GROEPJE CODE COMMENT ---
    // Logica om de reply-input te tonen/verbergen.
    if (!this.canReplyToThisLevel()) {
      this.logger.warn(`${this.logPrefix()} Cannot reply at level ${this.currentIndentationLevel()}. Max level is ${this.MAX_NESTING_LEVEL}.`);
      this.notificationService.showInfo('social.feed.maxNestingReached');
      return;
    }
    if (!this.canReply()) {
      this.logger.warn(`${this.logPrefix()} User cannot reply (likely not logged in).`);
      return;
    }
    this.isReplying.update(v => !v);
  }

  public submitReply(submitData: CommentSubmitData): void {
    // --- GROEPJE CODE COMMENT ---
    // Logica om een nieuwe reply te versturen (inclusief media-upload).
    const currentReply = this.currentReplySafe();
    const mainParentId = this.mainParentItemId();
    const logCtx = this.logPrefix();

    if (!currentReply || !mainParentId || !currentReply.feedId) {
        this.logger.error(`${logCtx} Cannot submit reply, missing required context IDs.`);
        this.notificationService.showErrorDialog('common.messages.error', 'errors.replies.cannotSubmit');
        return;
    }

    const content = submitData.text?.trim() ?? '';
    const gifUrl = submitData.gifUrl;
    const files = submitData.files ?? [];

    if (!content && !gifUrl && files.length === 0) {
        this.logger.warn(`${logCtx} Attempted to submit an empty reply.`);
        this.notificationService.showWarning('errors.validation.requiredField');
        return;
    }

    this.uploadProgress.set(0);

    const uploadObservables$: Observable<Media>[] = files.map((file: File) =>
      this.mediaService.uploadMediaWithProgress(file).pipe(
        filter((event): event is HttpResponse<Media> => event.type === HttpEventType.Response),
        map(event => {
          const mediaData = event.body;
          if (!mediaData || !mediaData.id || !mediaData.type) {
              this.logger.error(`${logCtx} Invalid media data received for ${file.name}:`, event.body);
              throw new Error(`Invalid media data received for ${file.name}`);
          }
          if (mediaData.type === MediaType.IMAGE && (!('variants' in mediaData) || !Array.isArray(mediaData.variants) || mediaData.variants.length === 0)) {
              this.logger.error(`${logCtx} Image data missing variants for ${file.name}:`, mediaData);
              throw new Error(`Image data missing variants for ${file.name}`);
          }
          this.logger.info(`${logCtx} File ${file.name} uploaded successfully.`, mediaData);
          return mediaData;
        }),
        catchError(uploadError => {
            this.logger.error(`${logCtx} Upload failed for file ${file.name}:`, uploadError);
            return throwError(() => uploadError);
        })
      )
    );

    const uploadsComplete$ = files.length > 0 ? forkJoin(uploadObservables$) : of([]);

    uploadsComplete$.pipe(
      take(1),
      catchError(error => {
        this.logger.error(`${logCtx} Upload process failed. Aborting reply submission.`, error);
        this.notificationService.showErrorDialog('common.errors.uploadFailedTitle', 'common.errors.uploadFailedMessage');
        this.uploadProgress.set(null);
        return of(null);
      })
    ).subscribe(uploadedMediaArrayOrNull => {
      this.uploadProgress.set(null);
      if (uploadedMediaArrayOrNull === null) {
        this.logger.warn(`${logCtx} Reply submission aborted due to upload failure.`);
        return;
      }

      const uploadedMediaArray = uploadedMediaArrayOrNull as Media[];
      this.logger.info(`${logCtx} Uploads complete. Count: ${uploadedMediaArray.length}`);

      this.feedFacade.addFeedReply(
        currentReply.feedId,
        mainParentId,
        content,
        currentReply.id,
        uploadedMediaArray,
        gifUrl ?? undefined
      );

      this.isReplying.set(false);
      // Toon de geneste replies sectie automatisch na het posten van een nieuwe.
      this.areNestedRepliesVisible.set(true);
      this.logger.info(`${logCtx} Reply successfully submitted via facade.`);
    });
  }

  public cancelReply(): void {
    // --- GROEPJE CODE COMMENT ---
    // Logica om de reply-input te annuleren.
    this.isReplying.set(false);
  }

  public onDelete(): void {
    // --- GROEPJE CODE COMMENT ---
    // Logica om een reply te verwijderen (met confirmatie dialoog).
    const currentReply = this.currentReplySafe();
    if (!this.canEditOrDelete() || !currentReply) return;

    const dialogData: ConfirmationDialogData = {
        titleKey: 'social.feed.deleteReplyConfirmTitle',
        messageKey: 'social.feed.deleteReplyConfirmMessage',
        confirmButtonKey: 'common.buttons.delete',
        confirmButtonType: 'theme-fire',
    };
    const overlayRef = this.overlayService.open<ConfirmationDialogResult, ConfirmationDialogData>({
        component: ConfirmationDialogComponent, data: dialogData, backdropType: 'dark',
        closeOnClickOutside: false, panelClass: 'confirmation-dialog-panel', positionStrategy: 'global-center',
    });

    overlayRef.afterClosed$.pipe(take(1)).subscribe((result) => {
      if (result === true) {
        this.feedFacade.deleteFeedReply(currentReply.feedId, currentReply.parentId, currentReply.id);
      }
    });
  }

  public onReport(): void {
    // --- GROEPJE CODE COMMENT ---
    // Logica om een reply te rapporteren.
    const currentReply = this.currentReplySafe();
    if (currentReply) {
      this.feedFacade.reportFeedReply(currentReply.feedId, currentReply.parentId, currentReply.id, 'Reason placeholder');
      this.notificationService.showSuccess('social.feed.reportSubmitted');
    }
  }

  public onShare(): void {
    // --- GROEPJE CODE COMMENT ---
    // Logica om een reply te delen.
    this.notificationService.showInfo('Delen van reactie nog niet geïmplementeerd.');
  }

  public handleCommentReaction(reaction: ReactionType | null): void {
    // --- GROEPJE CODE COMMENT ---
    // Logica om te reageren op een reply (toggle).
    const currentReply = this.currentReplySafe();
    if (!currentReply) return;
    const reactionToSend = this.currentUserReaction() === reaction ? null : reaction;
    this.dispatchReaction(reactionToSend);
  }
  
  public showNestedReplies(): void {
    // --- GROEPJE CODE COMMENT ---
    // Logica om verborgen geneste replies zichtbaar te maken.
    this.areNestedRepliesVisible.set(true);
  }

  // === PRIVATE METHODS ===

  private dispatchReaction(reaction: ReactionType | null): void {
    // --- Helper voor het dispatchen van de reactie-actie.
    const currentReply = this.currentReplySafe();
    if (!currentReply) return;
    this.feedFacade.reactToFeedReply(currentReply.feedId, currentReply.parentId, currentReply.id, reaction);
  }

  protected getAppIcon(reactionType: ReactionType | null | undefined): AppIcon {
    // --- Helper om ReactionType naar AppIcon te mappen.
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

  protected getTotalReactionCount(reactions?: readonly ReactionSummary[] | null): number {
    // --- Helper om het totaal aantal reacties te berekenen.
    return reactions?.reduce((sum, r) => sum + (r.count ?? 0), 0) ?? 0;
  }

  protected getTopReactions(reactions: readonly ReactionSummary[] | undefined | null, topN: number): ReactionSummary[] {
    // --- Helper om de top N reacties op te halen.
    if (!reactions) return [];
    return [...reactions].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)).slice(0, topN);
  }

  protected getReactionTooltip(reactions?: readonly ReactionSummary[] | null): string {
    // --- Helper om een tooltip voor reacties te genereren.
    const defaultTooltip = this.translate.instant('social.feed.tooltips.react');
    if (!reactions || reactions.length === 0) return defaultTooltip;
    const tooltipText = reactions.filter(r=>(r.count ?? 0)>0).map(r=>`${r.type}: ${r.count}`).join('\n');
    return tooltipText || defaultTooltip;
  }

  protected openReactionListModal(item: FeedReply): void {
       // --- Helper om de reactielijst modal te openen.
       const currentReply = this.currentReplySafe();
       if (!currentReply || !item) return;
       this.notificationService.showInfo('Viewing reaction list is not yet implemented.');
  }

  protected getImageMedia(mediaList: Media[] | null | undefined): Image[] {
    // --- Helper voor de template om alleen Image-objecten te filteren.
    if (!mediaList) return [];
    return mediaList.filter((item): item is Image => item.type === MediaType.IMAGE);
  }
}