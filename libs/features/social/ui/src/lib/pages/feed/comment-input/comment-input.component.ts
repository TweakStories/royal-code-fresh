// libs/features/social/src/lib/pages/feed/comment-input/comment-input.component.ts
/**
 * @fileoverview Component for inputting comments/replies, including text, emoji, GIF, and image attachments.
 * Uses the reusable UiTextareaComponent for text input and adapts layout for mobile usability.
 *
 * @Component CommentInputComponent
 * @description
 * Provides a rich input field for composing comments or replies. Features include:
 * - Text input via `UiTextareaComponent` with dynamic height adjustment and character counter.
 * - Integration with overlays for Emoji and GIF selection.
 * - Local image preview and handling for multi-image uploads.
 * - Responsive adjustments for button sizes, padding, and preview dimensions.
 * - Emits `submitted` event with `CommentSubmitData` or `cancelled` event.
 * - Optionally displays user avatar, hidden on extra-small screens for more input space.
 * @version 1.1.1 - Corrected UiImageComponent bindings for avatar.
 */
import {
  AfterViewInit, ChangeDetectionStrategy, Component, computed,
  DestroyRef, effect, ElementRef, inject, input, InputSignal, OnInit, output,
  OutputEmitterRef, signal, viewChild, Injector,
  Signal,
  afterNextRender
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiTextareaComponent } from '@royal-code/ui/textarea';
import { AppIcon } from '@royal-code/shared/domain';
import { Image, ImageVariant } from '@royal-code/shared/domain';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { EmojiPickerComponent } from '../../../components/emoji-picker/emoji-picker.component';
import { GifPickerComponent } from '../../../components/gif-picker/gif-picker.component';
import { LoggerService } from '@royal-code/core/core-logging';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppConfig, APP_CONFIG } from '@royal-code/core/config';
import { EmojiSelectionService } from '@royal-code/features/social/core';

interface ImagePreview {
  file: File;
  dataUrl: string;
  id: string;
}

export interface CommentSubmitData {
  text: string;
  gifUrl?: string | null;
  files?: File[];
}

@Component({
  selector: 'royal-code-comment-input',
  standalone: true,
  imports: [ FormsModule, TranslateModule, UiButtonComponent, UiIconComponent, UiTextareaComponent, UiImageComponent ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-start space-x-0 sm:space-x-3 w-full">
      @if(showAvatar()) {
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 mt-1 sm:mt-0 hidden sm:block bg-muted">
          @if (avatar(); as avatarImage) {
            <royal-code-ui-image
              [image]="avatarImage"
              [alt]="altText() | translate"
              [rounded]="true"
              objectFit="cover"
              class="w-full h-full"
            />
          } @else {
            <div class="w-full h-full flex items-center justify-center text-secondary-foreground text-sm font-semibold bg-secondary">?</div>
          }
        </div>
      }

      <div class="flex flex-col flex-1 space-y-1 w-full" [class.sm:max-w-[calc(100%-3.25rem)]]="showAvatar()">
        <div class="relative bg-card-primary rounded-xs p-1.5 sm:p-2 border border-border focus-within:ring-2 focus-within:ring-primary">

          <!-- Media Previews -->
          @if (attachedGifUrl() || selectedImagePreviews().length > 0) {
            <div class="mb-2 px-1">
              @if (attachedGifUrl(); as gifUrl) {
                <div class="relative inline-block mr-2 mb-1 border border-border rounded">
                  <img [src]="gifUrl" alt="Selected GIF" class="max-h-16 sm:h-20 object-contain rounded">
                  <button (click)="removeAttachedGif()" class="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-xs leading-none focus:outline-none focus:ring-1 focus:ring-ring" aria-label="Remove GIF">✕</button>
                </div>
              }
              @if (selectedImagePreviews().length > 0) {
                <div class="flex flex-wrap gap-1">
                  @for (preview of selectedImagePreviews(); track preview.id) {
                    <div class="relative border border-border rounded w-16 h-16 sm:w-20 sm:h-20">
                      <img [src]="preview.dataUrl" [alt]="preview.file.name" class="w-full h-full object-cover rounded">
                      <button (click)="removeImagePreview(preview.id)" class="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-xs leading-none focus:outline-none focus:ring-1 focus:ring-ring" [attr.aria-label]="'Remove image ' + preview.file.name">✕</button>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Textarea (nu met autosize) -->
          <royal-code-ui-textarea
  #commentTextarea
  [(value)]="currentText"
  [placeholder]="placeholder() | translate"
  [maxLength]="500"
  [minHeightPx]="38"
  [maxHeightPx]="120"
  extraTextareaClasses="!p-2 !text-sm !ring-inset !focus:ring-inset !bg-muted"
  ariaLabel="Comment text area"
  (keydown.enter)="handleEnterKey($event)"
  (keydown.escape)="onCancel()"
  [showCharCounter]="false"
  cdkFocusInitial>
</royal-code-ui-textarea>


          <!-- Footer met acties en knoppen -->
          <footer class="flex items-center justify-between mt-2 px-1">
             <div class="flex items-center space-x-0">
               <royal-code-ui-button type="transparent" sizeVariant="xs" extraClasses="sm:h-9 sm:px-2 sm:text-sm !py-1" (clicked)="onPhotoClick()" [title]="'social.feed.addPhoto' | translate">
                  <royal-code-ui-icon [icon]="AppIcon.Camera" sizeVariant="xs" extraClass="sm:h-4 sm:w-4" colorClass="text-primary"/>
               </royal-code-ui-button>
               <span #gifButtonWrapper>
                 <royal-code-ui-button type="transparent" sizeVariant="xs" extraClasses="sm:h-9 sm:px-2 sm:text-sm !py-1" (clicked)="onGifClick()" [title]="'social.feed.addGif' | translate">
                   <royal-code-ui-icon [icon]="AppIcon.Gift" sizeVariant="xs" extraClass="sm:h-4 sm:w-4" colorClass="text-primary"/>
                 </royal-code-ui-button>
               </span>
               <span #emojiButtonWrapper>
                 <royal-code-ui-button type="transparent" sizeVariant="xs" extraClasses="sm:h-9 sm:px-2 sm:text-sm !py-1" (clicked)="onEmojiClick()" [title]="'social.feed.addEmoji' | translate">
                   <royal-code-ui-icon [icon]="AppIcon.Smile" sizeVariant="xs" extraClass="sm:h-4 sm:w-4" colorClass="text-primary"/>
                 </royal-code-ui-button>
               </span>
             </div>
             <!-- FIX: Submit/Cancel knoppen hier geplaatst -->
             <div class="flex items-center text-xs space-x-1">
                @if (showCancelButton()) {
                  <royal-code-ui-button type="transparent" sizeVariant="sm" (clicked)="onCancel()">
                    <span class="text-primary-foreground">{{ 'common.buttons.cancel' | translate }}</span>
                  </royal-code-ui-button>
                }
                <royal-code-ui-button type="primary" sizeVariant="sm" (click)="onSubmit()" [disabled]="isSubmitDisabled()">
                  {{ submitLabel() | translate }}
                </royal-code-ui-button>
             </div>
          </footer>
        </div>

        <!-- FIX: Hint verwijderd -->
      </div>
    </div>
  `,
})
export class CommentInputComponent implements AfterViewInit, OnInit {
  readonly altText: InputSignal<string> = input<string>('social.feed.userAvatarAlt');
  readonly avatar: InputSignal<Image | undefined> = input.required<Image | undefined>();
  readonly initialText: InputSignal<string | undefined> = input<string | undefined>('');
  readonly placeholder: InputSignal<string> = input<string>('social.feed.replyPlaceholder');
  readonly showCancelButton: InputSignal<boolean> = input<boolean>(true);
  readonly submitLabel: InputSignal<string> = input<string>('common.buttons.submit');
  readonly showAvatar: InputSignal<boolean> = input<boolean>(true);

  readonly cancelled: OutputEmitterRef<void> = output<void>();
  readonly submitted: OutputEmitterRef<CommentSubmitData> = output<CommentSubmitData>();

  private readonly commentTextareaRef = viewChild<UiTextareaComponent>('commentTextarea');
  private readonly emojiButtonEl = viewChild.required<ElementRef<HTMLElement>>('emojiButtonWrapper'); // Renamed to match template
  private readonly gifButtonEl = viewChild.required<ElementRef<HTMLElement>>('gifButtonWrapper'); // Renamed to match template
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  private readonly overlayService = inject(DynamicOverlayService);
  private readonly logger = inject(LoggerService);
  private readonly emojiSelectionService = inject(EmojiSelectionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly logPrefix = '[CommentInputComponent]';
  private readonly appConfig = inject<AppConfig>(APP_CONFIG);

  readonly currentText = signal<string>('');
  readonly attachedGifUrl = signal<string | null>(null);
  readonly selectedImagePreviews = signal<ImagePreview[]>([]);
  readonly AppIcon = AppIcon;
  private avatarLoadError = signal(false); // Intern signaal voor avatar laadfout

  readonly charCount = computed(() => this.currentText()?.length ?? 0);
  readonly isSubmitDisabled = computed(() =>
    !this.currentText().trim() && !this.attachedGifUrl() && this.selectedImagePreviews().length === 0
  );

  constructor() {
    this.logger.debug(`${this.logPrefix} Instance created.`);
    effect(() => {
        const initText = this.initialText() ?? '';
        this.currentText.set(initText);
        this.logger.debug(`${this.logPrefix} Initial text updated: "${initText}"`);
    }, { injector: this.injector });
  }

  ngOnInit(): void {
    this.logger.debug(`${this.logPrefix} Subscribing to EmojiSelectionService.`);
    this.emojiSelectionService.emojiSelected$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(emoji => {
            this.logger.debug(`${this.logPrefix} Received emoji from service: ${emoji}`);
            this.insertEmoji(emoji);
        });
  }

  ngAfterViewInit(): void {
    this.focusTextarea();
    if (!this.commentTextareaRef()) { this.logger.warn(`${this.logPrefix} commentTextareaRef not found after view init.`); }
    if (!this.emojiButtonEl()) { this.logger.warn(`${this.logPrefix} emojiButtonEl not found after view init.`); }
    if (!this.gifButtonEl()) { this.logger.warn(`${this.logPrefix} gifButtonEl not found after view init.`); }
    if (!this.fileInput()) { this.logger.warn(`${this.logPrefix} fileInput not found after view init.`); }
  }

  handleEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      if (!this.isSubmitDisabled()) { this.onSubmit(); }
    }
  }

  onCancel(): void {
    this.logger.debug(`${this.logPrefix} Cancel action triggered.`);
    this.resetInputState();
    this.cancelled.emit();
  }

  onSubmit(): void {
    const text = this.currentText().trim();
    const gifUrl = this.attachedGifUrl();
    const files = this.selectedImagePreviews().map(p => p.file);

    if (text || gifUrl || files.length > 0) {
        this.logger.info(`${this.logPrefix} Submitting comment data.`, { textExists: !!text, gifUrl, fileCount: files.length });
        this.submitted.emit({ text, gifUrl, files });
        this.resetInputState();
    } else {
        this.logger.warn(`${this.logPrefix} Submit triggered but no content available.`);
    }
  }

  onEmojiClick(): void {
    const triggerElement = this.emojiButtonEl()?.nativeElement;
    if (!triggerElement) { this.logger.error(`${this.logPrefix} Emoji button element not found!`); return; }
    this.logger.debug(`${this.logPrefix} Opening emoji picker overlay...`);
    this.overlayService.open<void>({ component: EmojiPickerComponent, origin: triggerElement, positionStrategy: 'connected', connectedPosition: [{ originX: 'center', originY: 'top',    overlayX: 'center', overlayY: 'bottom', offsetY: -8 },{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top',    offsetY:  8 },], backdropType: 'transparent', closeOnClickOutside: true, mobileFullscreen: true, panelClass: ['emoji-picker-overlay'], });
  }

  private insertEmoji(emoji: string): void {
     const currentVal = this.currentText() ?? '';
     const newValue = currentVal + emoji;
     this.currentText.set(newValue);
     this.logger?.debug(`${this.logPrefix} Emoji inserted (appended): "${emoji}"`);
     this.focusTextarea();
  }

  onGifClick(): void {
    const triggerElement = this.gifButtonEl()?.nativeElement;
    if (!triggerElement) { this.logger.error(`${this.logPrefix} GIF button element not found!`); return; }
    this.logger.debug(`${this.logPrefix} Opening GIF picker overlay...`);
    const overlayRef = this.overlayService.open<string>({ component: GifPickerComponent, origin: triggerElement, positionStrategy: 'connected', connectedPosition: [{ originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },], backdropType: 'transparent', closeOnClickOutside: true, panelClass: ['gif-picker-overlay'], mobileFullscreen: true, });
    overlayRef.afterClosed$.subscribe(gifUrl => {
      if (gifUrl) {
        this.logger.info(`${this.logPrefix} GIF selected: ${gifUrl}`);
        this.attachedGifUrl.set(gifUrl);
        this.selectedImagePreviews.set([]);
      } else {
          this.logger.debug(`${this.logPrefix} GIF picker closed without selection.`);
      }
    });
  }

  removeAttachedGif(): void {
    this.attachedGifUrl.set(null);
    this.logger.debug(`${this.logPrefix} Attached GIF removed.`);
  }

  onPhotoClick(): void {
    this.logger.debug(`${this.logPrefix} Photo button clicked, triggering file input.`);
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const logCtx = `${this.logPrefix} [onFileSelected]`;
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) { this.logger.debug(`${logCtx} No files selected.`); return; }

    this.logger.info(`${logCtx} Files selected via input: ${files.length}`);
    this.attachedGifUrl.set(null);

    const currentPreviews = this.selectedImagePreviews();
    const maxFiles = this.appConfig.mediaUpload.maxFiles;
    const allowedTypes = this.appConfig.mediaUpload.allowedImageTypes;
    const maxSizeMB = this.appConfig.mediaUpload.maxSizeMb;
    const maxSizeInBytes = maxSizeMB * 1024 * 1024;
    const limit = Math.min(files.length, maxFiles - currentPreviews.length);
    const newPreviews: ImagePreview[] = [];

    if (limit <= 0 && files.length > 0) {
        this.logger.warn(`${logCtx} Max image limit (${maxFiles}) reached.`);
        target.value = ''; return;
    }

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
        } else { this.logger.error(`${logCtx} FileReader null result for file ${file.name}.`); }
        if (processedCount === limit) { this.updatePreviewsIfNeeded(newPreviews); }
      };
      reader.onerror = (error) => {
          processedCount++;
          this.logger.error(`${logCtx} FileReader error for file ${file.name}:`, error);
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

  removeImagePreview(previewId: string): void {
    this.selectedImagePreviews.update(previews => previews.filter(p => p.id !== previewId));
    this.logger.debug(`${this.logPrefix} Removed image preview: ${previewId}`);
  }

  private resetInputState(): void {
    this.currentText.set('');
    this.attachedGifUrl.set(null);
    this.selectedImagePreviews.set([]);
    this.logger.debug(`${this.logPrefix} Input state reset.`);
  }

  focusTextarea(): void {
     const cleanup = afterNextRender(() => {
        this.commentTextareaRef()?.focus();
        this.logger.debug(`${this.logPrefix} Textarea focused programmatically.`);
     }, { injector: this.injector });
  }

  /** Handles errors when loading the avatar image. */
  handleAvatarError(): void {
    this.logger.warn(`${this.logPrefix} Avatar image for current user failed to load. Falling back to initials/placeholder.`);
    this.avatarLoadError.set(true);
  }
}
