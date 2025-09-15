// libs/features/social/src/lib/pages/feed/feed-input/feed-input.component.ts
/**
 * @fileoverview Defines the FeedInputComponent, used for creating new top-level feed posts.
 * It allows text input via UiTextareaComponent, attaching media (GIF or images), and inserting emojis.
 * Features include auto-resizing textarea, character counter, media previews,
 * and responsive layout adjustments for mobile usability.
 *
 * @Component FeedInputComponent
 * @description
 * Provides the primary user interface for composing new feed posts. It encapsulates
 * the text area (using UiTextareaComponent), action buttons (media, GIF, emoji), media preview logic, and
 * submission/cancellation handling. It collaborates with overlay services for
 * pickers (Emoji, GIF) and emits the final post data, including any selected/uploaded
 * media files, for the parent component (e.g., FeedComponent) to process further.
 * It adapts its layout for smaller screens by hiding the user avatar.
 * @version 1.1.0 - Corrected bindings for UiImageComponent (variants, rounded) for avatar display.
 */
import {
  Component, ChangeDetectionStrategy, InputSignal, OutputEmitterRef, OnInit,
  AfterViewInit, OnDestroy, DestroyRef, ElementRef, Injector,
  inject, input, output, signal, computed, viewChild, afterNextRender,
  Signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// --- Project UI Components ---
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiImageComponent } from '@royal-code/ui/image';
import { UiTextareaComponent } from '@royal-code/ui/textarea';

// --- Project Domain/Shared Models & Enums ---
import { AppIcon } from '@royal-code/shared/domain';
import { Image } from '@royal-code/shared/domain';
import { APP_CONFIG, AppConfig } from '@royal-code/core/config';

// --- Project Core & Feature Services ---
import { LoggerService } from '@royal-code/core/core-logging';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { EmojiPickerComponent } from '../../../components/emoji-picker/emoji-picker.component';
import { GifPickerComponent } from '../../../components/gif-picker/gif-picker.component';
import { EmojiSelectionService } from '@royal-code/features/social/core';

interface ImagePreview {
  file: File;
  dataUrl: string;
  id: string;
}

export interface FeedPostSubmitData {
  text: string;
  gifUrl?: string | null;
  files?: File[];
}

@Component({
  selector: 'royal-code-feed-input',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    UiButtonComponent,
    UiIconComponent,
    UiImageComponent,
    UiTextareaComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex space-x-2 sm:space-x-3 p-2 sm:p-4 bg-card-primary rounded-xs border border-border shadow-sm">
      @if(currentUserAvatar(); as avatar) {
        <div class="flex-shrink-0 hidden sm:block mt-1">
          <royal-code-ui-image
            [image]="avatar"
            [alt]="'social.feed.yourAvatarAlt' | translate"
            [rounded]="true"
            objectFit="cover"
            (imageError)="handleAvatarError()"
          />
        </div>
      }

      <div class="flex-1 flex flex-col">
        <div class="relative">
          <royal-code-ui-textarea
            #feedTextarea
            [(value)]="postText"
            [placeholder]="'social.feed.placeholders.post' | translate"
            [maxLength]="1000"
            [minHeightPx]="80"
            [rows]="3"
            extraTextareaClasses="min-h-[5rem] sm:min-h-[6rem] !p-2 !pr-10 !text-sm sm:!text-base !bg-background"
            [ariaLabel]="'Nieuw feed bericht'"
            (keydown.enter)="handleEnterKey($event)"
            (keydown.escape)="cancelPost()"
            cdkFocusInitial>
          </royal-code-ui-textarea>
        </div>

        <div class="mt-2">
           @if (attachedGifUrl(); as gifUrl) {
             <div class="relative inline-block mr-2 mb-1 border border-border rounded max-w-[50%] align-bottom">
               <img [src]="gifUrl" alt="Selected GIF" class="max-h-24 object-contain rounded">
               <button (click)="removeAttachedGif()" type="button"
                       class="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-xs leading-none focus:outline-none focus:ring-1 focus:ring-ring"
                       aria-label="Remove GIF">✕</button>
             </div>
           }
           @if (selectedImagePreviews().length > 0) {
             <div class="flex flex-wrap gap-1">
               @for (preview of selectedImagePreviews(); track preview.id) {
                 <div class="relative border border-border rounded w-16 h-16 sm:w-20 sm:h-20">
                   <img [src]="preview.dataUrl" [alt]="preview.file.name" class="w-full h-full object-cover rounded">
                   <button (click)="removeImagePreview(preview.id)" type="button"
                           class="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-xs leading-none focus:outline-none focus:ring-1 focus:ring-ring"
                           [attr.aria-label]="'Remove image ' + preview.file.name">✕</button>
                 </div>
               }
             </div>
           }
        </div>

        <div class="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <div class="flex items-center space-x-0">
             <royal-code-ui-button
                type="primary"
                sizeVariant="xs"
                extraClasses="sm:h-9 sm:px-2 sm:text-sm !py-1"
                (clicked)="onAddPhotoClick()"
                [title]="'social.feed.addPhoto' | translate">
                <royal-code-ui-icon [icon]="AppIcon.Camera" sizeVariant="xs" extraClass="sm:h-4 sm:w-4" colorClass="text-primary-foreground" />
             </royal-code-ui-button>
             <span #gifButtonWrapper>
                <royal-code-ui-button
                    type="primary"
                    sizeVariant="xs"
                    extraClasses="sm:h-9 sm:px-2 sm:text-sm !py-1"
                    (clicked)="onAddGifClick()"
                    [title]="'social.feed.addGif' | translate">
                    <royal-code-ui-icon [icon]="AppIcon.Gift" sizeVariant="xs" extraClass="sm:h-4 sm:w-4" colorClass="text-primary-foreground" />
                </royal-code-ui-button>
             </span>
             <span #emojiButtonWrapper>
                <royal-code-ui-button
                    type="primary"
                    sizeVariant="xs"
                    extraClasses="sm:h-9 sm:px-2 sm:text-sm !py-1"
                    (clicked)="onAddEmojiClick()"
                    [title]="'social.feed.addEmoji' | translate">
                    <royal-code-ui-icon [icon]="AppIcon.Smile" sizeVariant="xs" extraClass="sm:h-4 sm:w-4" colorClass="text-primary-foreground" />
                </royal-code-ui-button>
            </span>
          </div>
          <div class="flex items-center space-x-2">
             <royal-code-ui-button type="default" sizeVariant="sm" (clicked)="cancelPost()"> {{ 'common.buttons.cancel' | translate }} </royal-code-ui-button>
             <royal-code-ui-button type="primary" sizeVariant="sm" (clicked)="submitPost()" [disabled]="isSubmitDisabled()"> {{ 'social.feed.actions.post' | translate }} </royal-code-ui-button>
          </div>
        </div>

       <input #fileInput type="file" accept="image/*" multiple class="hidden" (change)="onFileSelected($event)">
    </div>
  `,
})
export class FeedInputComponent implements AfterViewInit, OnInit, OnDestroy {
  readonly currentUserAvatar: InputSignal<Image | undefined> = input.required<Image | undefined>();
  readonly postSubmitted: OutputEmitterRef<FeedPostSubmitData> = output<FeedPostSubmitData>();
  readonly cancelled: OutputEmitterRef<void> = output<void>();

  private readonly logger = inject(LoggerService);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly emojiSelectionService = inject(EmojiSelectionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly appConfig = inject<AppConfig>(APP_CONFIG);
  private readonly logPrefix = '[FeedInputComponent]';

  protected postText = signal<string>('');
  readonly attachedGifUrl = signal<string | null>(null);
  readonly selectedImagePreviews = signal<ImagePreview[]>([]);
  readonly AppIcon = AppIcon;
  readonly defaultavatar = 'images/default-avatar.png';
  private  readonly avatarLoadError = signal(false); // Intern signaal voor avatar laadfout

  private readonly feedTextareaRef = viewChild<UiTextareaComponent>('feedTextarea');
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private readonly emojiButtonWrapperRef = viewChild.required<ElementRef<HTMLElement>>('emojiButtonWrapper');
  private readonly gifButtonWrapperRef = viewChild.required<ElementRef<HTMLElement>>('gifButtonWrapper');

  readonly charCount = computed(() => this.postText()?.length ?? 0);
  readonly isSubmitDisabled = computed(() =>
    !this.postText()?.trim() && !this.attachedGifUrl() && this.selectedImagePreviews().length === 0
  );

  constructor() {
    this.logger.debug(`${this.logPrefix} Instance created.`);
  }

  ngOnInit(): void {
    this.logger.debug(`${this.logPrefix} OnInit: Subscribing to EmojiSelectionService.`);
    this.emojiSelectionService.emojiSelected$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(emoji => {
            this.logger.debug(`${this.logPrefix} Received emoji from service: ${emoji}`);
            this.insertEmoji(emoji);
        });
  }

  ngAfterViewInit(): void {
    this.logger.debug(`${this.logPrefix} AfterViewInit: Attempting initial focus.`);
    this.focusTextarea();
  }

  ngOnDestroy(): void {
      this.logger.debug(`${this.logPrefix} Destroyed.`);
  }

  handleEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      if (!this.isSubmitDisabled()) { this.submitPost(); }
    }
  }

  submitPost(): void {
    const text = this.postText().trim();
    const gifUrl = this.attachedGifUrl();
    const files = this.selectedImagePreviews().map(p => p.file);

    if (text || gifUrl || files.length > 0) {
      this.logger.info(`${this.logPrefix} Emitting postSubmitted event.`);
      this.postSubmitted.emit({ text, gifUrl, files });
      this.resetInputState();
    } else {
      this.logger.warn(`${this.logPrefix} Submit triggered with no content.`);
    }
  }

  cancelPost(): void {
    this.logger.debug(`${this.logPrefix} Cancel clicked.`);
    this.resetInputState();
    this.cancelled.emit();
  }

  onAddEmojiClick(): void {
      const triggerElement = this.emojiButtonWrapperRef()?.nativeElement;
      if (!triggerElement) { this.logger.error(`${this.logPrefix} Emoji button wrapper not found!`); return; }
      this.logger.debug(`${this.logPrefix} Opening emoji picker...`);
      this.overlayService.open<void>({ component: EmojiPickerComponent, origin: triggerElement, positionStrategy: 'connected', connectedPosition: [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 }], backdropType: 'transparent', closeOnClickOutside: true, mobileFullscreen: true, panelClass: ['emoji-picker-overlay'] });
  }

  onAddGifClick(): void {
    const triggerElement = this.gifButtonWrapperRef()?.nativeElement;
    if (!triggerElement) { this.logger.error(`${this.logPrefix} GIF button wrapper not found!`); return; }
    this.logger.debug(`${this.logPrefix} Opening GIF picker...`);
    const overlayRef = this.overlayService.open<string>({ component: GifPickerComponent, origin: triggerElement, positionStrategy: 'connected', connectedPosition: [{ originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom', offsetY: -8 },{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top',    offsetY:  8 }], backdropType: 'transparent', closeOnClickOutside: true, panelClass: ['gif-picker-overlay'], mobileFullscreen: true });
    overlayRef.afterClosed$.subscribe(gifUrl => {
      if (gifUrl) { this.logger.info(`${this.logPrefix} GIF selected: ${gifUrl}`); this.attachedGifUrl.set(gifUrl); this.selectedImagePreviews.set([]); }
      else { this.logger.debug(`${this.logPrefix} GIF picker closed without selection.`); }
    });
  }

  onAddPhotoClick(): void {
    this.logger.debug(`${this.logPrefix} Triggering file input.`);
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const logCtx = `${this.logPrefix} [onFileSelected]`;
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) { this.logger.debug(`${logCtx} No files selected.`); return; }

    this.logger.info(`${logCtx} Files selected: ${files.length}`);
    this.attachedGifUrl.set(null);

    const currentPreviews = this.selectedImagePreviews();
    const maxFiles = this.appConfig.mediaUpload.maxFiles;
    const allowedTypes = this.appConfig.mediaUpload.allowedImageTypes;
    const maxSizeMB = this.appConfig.mediaUpload.maxSizeMb;
    const maxSizeInBytes = maxSizeMB * 1024 * 1024;
    const limit = Math.min(files.length, maxFiles - currentPreviews.length);

    if (limit <= 0 && files.length > 0) {
        this.logger.warn(`${logCtx} Max image limit (${maxFiles}) reached.`);
        target.value = ''; return;
    }

    this.logger.debug(`${logCtx} Processing ${limit} files.`);
    const newPreviews: ImagePreview[] = [];
    let processedCount = 0;

    for (let i = 0; i < limit; i++) {
        const file = files[i];
        if (!allowedTypes.includes(file.type) || file.size > maxSizeInBytes) {
            this.logger.warn(`${logCtx} Skipping invalid file: ${file.name}`);
            processedCount++; if (processedCount === limit) { this.updatePreviewsIfNeeded(newPreviews); }
            continue;
        }

        const reader = new FileReader();
        const previewId = `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`;
        reader.onload = (e: ProgressEvent<FileReader>) => {
            processedCount++;
            if (e.target?.result) {
                newPreviews.push({ file, dataUrl: e.target.result as string, id: previewId });
            } else { this.logger.error(`${logCtx} FileReader null result for ${file.name}.`); }
            if (processedCount === limit) { this.updatePreviewsIfNeeded(newPreviews); }
        };
        reader.onerror = (error) => {
            processedCount++;
            this.logger.error(`${logCtx} FileReader error for ${file.name}:`, error);
             if (processedCount === limit) { this.updatePreviewsIfNeeded(newPreviews); }
        };
        reader.readAsDataURL(file);
    }
    target.value = '';
  }

  private updatePreviewsIfNeeded(newPreviews: ImagePreview[]): void {
      if (newPreviews.length > 0) {
          this.selectedImagePreviews.update(existing => [...existing, ...newPreviews]);
          this.logger.info(`${this.logPrefix} Added ${newPreviews.length} image previews.`);
      }
  }

  removeAttachedGif(): void {
    this.attachedGifUrl.set(null);
    this.logger.debug(`${this.logPrefix} Attached GIF removed.`);
  }

  removeImagePreview(previewId: string): void {
    this.selectedImagePreviews.update(previews => previews.filter(p => p.id !== previewId));
    this.logger.debug(`${this.logPrefix} Removed image preview: ${previewId}`);
  }

  private insertEmoji(emoji: string): void {
    const logCtx = `${this.logPrefix} [insertEmoji]`;
    const currentVal = this.postText() ?? '';
    const newValue = currentVal + emoji;
    this.postText.set(newValue);
    this.logger?.debug(`${logCtx} Emoji appended: "${emoji}"`);
    this.focusTextarea();
  }

  private resetInputState(): void {
    this.postText.set('');
    this.attachedGifUrl.set(null);
    this.selectedImagePreviews.set([]);
    this.logger.debug(`${this.logPrefix} Input state reset.`);
  }

  focusTextarea(): void {
     const cleanup = afterNextRender(() => {
        this.feedTextareaRef()?.focus();
        this.logger.debug(`${this.logPrefix} Textarea focused programmatically.`);
     }, { injector: this.injector });
  }

  /**
   * Handles errors when loading the avatar image.
   * Sets an internal flag to fallback to initials.
   */
  handleAvatarError(): void {
    this.logger.warn(`${this.logPrefix} Avatar image failed to load. Falling back to initials.`);
    this.avatarLoadError.set(true);
  }
}
