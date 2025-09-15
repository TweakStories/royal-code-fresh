// libs/features/social/src/lib/components/chat-input/chat-input.component.ts
/**
 * @fileoverview Reusable component for chat message input, featuring text, emoji, GIF,
 * and image attachments. Adapted from CommentInputComponent for chat context.
 * Includes responsive layout for action buttons.
 * @version 2.1.0 - Responsive button layout.
 */
import {
  Component, ChangeDetectionStrategy, OnInit, AfterViewInit, OnDestroy,
  inject, input, output, signal, computed, viewChild, Injector,
  ElementRef, OutputEmitterRef, InputSignal, booleanAttribute, DestroyRef, afterNextRender
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { UiIconComponent } from '@royal-code/ui/icon';
import { UiTextareaComponent } from '@royal-code/ui/textarea';
import { AppIcon } from '@royal-code/shared/domain';
import { APP_CONFIG, AppConfig } from '@royal-code/core/config';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { LoggerService } from '@royal-code/core/core-logging';
import { EmojiPickerComponent, GifPickerComponent} from '@royal-code/features/social/ui';
import { EmojiSelectionService } from '@royal-code/features/social/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * @interface ImagePreview
 * @description Structure for local image preview data.
 */
interface ImagePreview {
  file: File;
  dataUrl: string;
  id: string;
}

/**
 * @interface ChatMessageSubmitData
 * @description Data structure emitted when a chat message is submitted.
 */
export interface ChatMessageSubmitData {
  text: string;
  gifUrl?: string | null;
  files?: File[];
}

@Component({
  selector: 'lib-chat-input',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    UiIconComponent,
    UiTextareaComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<!-- Main wrapper: Altijd flex-col, knoppen onder textarea -->
<div class="chat-input-wrapper flex flex-col items-end">

  <!-- Textarea & Previews (neemt meeste ruimte, altijd volledige breedte) -->
  <div class="flex-grow flex flex-col relative min-w-0 w-full">
    <!-- Media Previews -->
    @if (attachedGifUrl() || selectedImagePreviews().length > 0) {
      <div class="mb-1.5 max-h-24 overflow-y-auto px-1 pt-1 border border-border bg-card-secondary rounded-t-md">
        @if (attachedGifUrl(); as gifUrl) {
          <div class="relative inline-block mr-1 mb-1 border border-border rounded align-bottom max-w-[45%]">
            <img [src]="gifUrl" alt="Selected GIF" class="max-h-20 object-contain rounded">
            <button (click)="removeAttachedGif()" type="button"
                    class="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-xs leading-none focus:outline-none focus:ring-1 focus:ring-ring"
                    aria-label="Remove GIF">✕</button>
          </div>
        }
        @if (selectedImagePreviews().length > 0) {
          <div class="flex flex-wrap ">
            @for (preview of selectedImagePreviews(); track preview.id) {
              <div class="relative border border-border rounded w-16 h-16">
                <img [src]="preview.dataUrl" [alt]="preview.file.name" class="w-full h-full object-cover rounded">
                <button (click)="removeImagePreview(preview.id)" type="button"
                        class="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-xs leading-none focus:outline-none focus:ring-1 focus:ring-ring"
                        [attr.aria-label]="'Remove image ' + preview.file.name">✕</button>
              </div>
            }
          </div>
        }
      </div>
    }

    <!-- Textarea -->
    <royal-code-ui-textarea
      #chatTextareaEl
      [(value)]="currentText"
      [placeholder]="placeholder() | translate"
      [maxLength]="500"
      [minHeightPx]="inputMinHeight()"
      [maxHeightPx]="120"
      [extraTextareaClasses]="'!py-2 !px-3 !text-sm !ring-inset !focus:ring-inset !bg-card-secondary ' + (attachedGifUrl() || selectedImagePreviews().length > 0 ? '!rounded-b-md !rounded-t-none' : '!rounded-md')"
      ariaLabel="Chat message input"
      (keydown.enter)="handleEnterKey($event)"
      (keydown.escape)="onCancel()"
      cdkFocusInitial>
    </royal-code-ui-textarea>
  </div>

  @if (!hideBottomBar()) {
    <div class="flex items-center justify-between w-full flex-shrink-0 mt-1.5">
        <!-- Linker Actieknoppen (Emoji, GIF, Foto) - consistent grotere knoppen -->
        <div class="flex items-center gap-1">
          <button
          royal-code-ui-button type="primary" sizeVariant="icon"
          (click)="onEmojiClick()" class="!w-9 !h-9 !p-2"
          [title]="'chat.input.addEmoji' | translate" #emojiButton>
          <royal-code-ui-icon [icon]="AppIcon.Smile" sizeVariant="md" colorClass="text-primary-foreground"></royal-code-ui-icon>
        </button>
        <button
          royal-code-ui-button type="primary" sizeVariant="icon"
          (click)="onGifClick()" class="!w-9 !h-9 !p-2"
          [title]="'chat.input.addGif' | translate" #gifButton>
          <royal-code-ui-icon [icon]="AppIcon.Gift" sizeVariant="md" colorClass="text-primary-foreground"></royal-code-ui-icon>
        </button>
        <button
          royal-code-ui-button type="primary" sizeVariant="icon"
          (click)="onPhotoClick()" class="!w-9 !h-9 !p-2"
          [title]="'chat.input.addPhoto' | translate" #photoButton>
          <royal-code-ui-icon [icon]="AppIcon.Camera" sizeVariant="md" colorClass="text-primary-foreground"></royal-code-ui-icon>
        </button>
      </div>

      <!-- Verzendknop (rechts) - consistent grotere knop -->
      <button
        royal-code-ui-button type="primary" sizeVariant="icon"
        (click)="onSubmit()" [disabled]="isSubmitDisabled() || isSending()"
        class="!w-10 !h-10"
        [title]="'chat.input.send' | translate">
        @if (!isSending()) {
        } @else {
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
        }
      </button>
    </div>
  }
</div>

<!-- Hidden file input (blijft ongewijzigd) -->
<!-- Hidden file input (blijft ongewijzigd) -->
<input #fileInput type="file" accept="image/*" multiple class="hidden" (change)="onFileSelected($event)">
  `,
})
export class ChatInputComponent implements OnInit, AfterViewInit, OnDestroy {
  // --- Inputs ---
  /** Indicates if a message is currently being sent (e.g., waiting for API response). */
  readonly isSending: InputSignal<boolean> = input(false);
  /** Placeholder text for the textarea. */
    readonly placeholder: InputSignal<string> = input<string>('chat.input.placeholderDefault');
  /** Minimum height for the textarea in pixels. */
  readonly inputMinHeight: InputSignal<number> = input<number>(36); // Aangepast voor consistentie met button height

  /** Hides the bottom action bar (emoji, gif, photo, send buttons). */
  readonly hideBottomBar = input(false, { transform: booleanAttribute });

  // --- Outputs ---
  /** Emitted when the user submits the message data. */
  // --- Outputs ---
  /** Emitted when the user submits the message data. */
  readonly submitted: OutputEmitterRef<ChatMessageSubmitData> = output<ChatMessageSubmitData>();
  /** Emitted when the user cancels the input (e.g., by pressing Escape or if parent requests cancel). */
  readonly cancelled: OutputEmitterRef<void> = output<void>();

  // --- View Child References ---
  private readonly chatTextareaRef = viewChild<UiTextareaComponent>('chatTextareaEl');
  private readonly fileInputRef = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private readonly emojiButtonRef = viewChild.required<ElementRef<HTMLElement>>('emojiButton');
  private readonly gifButtonRef = viewChild.required<ElementRef<HTMLElement>>('gifButton');
  private readonly photoButtonRef = viewChild.required<ElementRef<HTMLElement>>('photoButton');

  // --- Dependencies ---
  private readonly logger = inject(LoggerService);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly emojiSelectionService = inject(EmojiSelectionService);
  private readonly appConfig = inject<AppConfig>(APP_CONFIG);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logPrefix = '[ChatInputComponent]';

  // --- Internal State ---
  /** Signal holding the current text content of the textarea. */
  readonly currentText = signal<string>('');
  /** Signal holding the URL of an attached GIF, or null. */
  readonly attachedGifUrl = signal<string | null>(null);
  /** Signal holding an array of local image previews. */
  readonly selectedImagePreviews = signal<ImagePreview[]>([]);

  /** Exposes the AppIcon enum to the template. */
  readonly AppIcon = AppIcon;

  /**
   * @computed isSubmitDisabled
   * @description Determines if the submit button should be disabled.
   * @returns {boolean} True if submission should be disabled.
   */
  readonly isSubmitDisabled = computed(() =>
    (!this.currentText().trim() && !this.attachedGifUrl() && this.selectedImagePreviews().length === 0) || this.isSending()
  );

  constructor() {
    this.logger.debug(`${this.logPrefix} Instance created.`);
  }

  ngOnInit(): void {
    this.emojiSelectionService.emojiSelected$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(emoji => this.insertEmoji(emoji));
  }

  ngAfterViewInit(): void {
    this.focusTextarea();
  }

  ngOnDestroy(): void {
    this.logger.debug(`${this.logPrefix} Destroyed.`);
  }

  /**
   * Handles Enter key press: submits if Shift is not held.
   * @param {Event} event - The keyboard event.
   */
  handleEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      if (!this.isSubmitDisabled()) {
        this.onSubmit();
      }
    }
  }

  /**
   * Emits submitted data and resets the input state.
   */
  onSubmit(): void {
    if (this.isSubmitDisabled()) return;

    const text = this.currentText().trim();
    const gifUrl = this.attachedGifUrl();
    const files = this.selectedImagePreviews().map(p => p.file);

    this.logger.info(`${this.logPrefix} Submitting chat message.`, { textLength: text.length, gifUrl, fileCount: files.length });
    this.submitted.emit({ text, gifUrl, files });
    this.resetInputState();
  }

  /**
   * Handles cancellation: resets state or emits `cancelled` event.
   */
  onCancel(): void {
    if (this.currentText().length > 0 || this.attachedGifUrl() || this.selectedImagePreviews().length > 0) {
        this.resetInputState();
    } else {
        this.cancelled.emit();
    }
  }

  /** Resets input fields and re-focuses the textarea. */
  private resetInputState(): void {
    this.currentText.set('');
    this.attachedGifUrl.set(null);
    this.selectedImagePreviews.set([]);
    this.focusTextarea();
    this.logger.debug(`${this.logPrefix} Input state reset.`);
  }

  /** Programmatically focuses the textarea. */
  private focusTextarea(): void {
    afterNextRender(() => {
      this.chatTextareaRef()?.focus();
    }, { injector: this.injector });
  }

  /** Opens image file picker. */
  onPhotoClick(): void {
    this.logger.debug(`${this.logPrefix} Photo button clicked.`);
    this.fileInputRef().nativeElement.value = ''; // Reset om zelfde bestand opnieuw te kunnen kiezen
    this.fileInputRef().nativeElement.click();
  }

  /** Opens GIF picker overlay. */
  onGifClick(): void {
    const triggerElement = this.gifButtonRef()?.nativeElement;
    if (!triggerElement) { this.logger.error(`${this.logPrefix} GIF button element not found!`); return; }

    this.logger.debug(`${this.logPrefix} Opening GIF picker.`);
    const overlayRef = this.overlayService.open<string>({
      component: GifPickerComponent,
      origin: triggerElement,
      positionStrategy: 'connected',
      connectedPosition: [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 }],
      backdropType: 'transparent',
      closeOnClickOutside: true,
      panelClass: ['gif-picker-overlay', '!max-w-[320px]'],
      mobileFullscreen: true,
    });

    overlayRef.afterClosed$.subscribe(gifUrl => {
      if (gifUrl) {
        this.logger.info(`${this.logPrefix} GIF selected: ${gifUrl}`);
        this.attachedGifUrl.set(gifUrl);
        this.selectedImagePreviews.set([]); // Clear images if GIF is chosen
      }
    });
  }

  /** Opens Emoji picker overlay. */
  onEmojiClick(): void {
    const triggerElement = this.emojiButtonRef()?.nativeElement;
    if (!triggerElement) { this.logger.error(`${this.logPrefix} Emoji button element not found!`); return; }

    this.logger.debug(`${this.logPrefix} Opening emoji picker.`);
    this.overlayService.open<void>({
      component: EmojiPickerComponent,
      origin: triggerElement,
      positionStrategy: 'connected',
      connectedPosition: [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 }],
      backdropType: 'transparent',
      closeOnClickOutside: true,
      mobileFullscreen: true,
      panelClass: ['emoji-picker-overlay'],
    });
  }

  /** Inserts selected emoji into textarea. */
  private insertEmoji(emoji: string): void {
    this.currentText.update(val => (val ?? '') + emoji);
    this.focusTextarea();
  }

  /** Removes attached GIF. */
  removeAttachedGif(): void {
    this.attachedGifUrl.set(null);
  }

  /** Removes an image preview by its ID. */
  removeImagePreview(previewId: string): void {
    this.selectedImagePreviews.update(previews => previews.filter(p => p.id !== previewId));
  }

  /** Handles file selection, validation, and preview generation. */
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    this.logger.info(`${this.logPrefix} Files selected: ${files.length}`);
    this.attachedGifUrl.set(null); // Clear GIF

    const currentPreviews = this.selectedImagePreviews();
    const maxFiles = this.appConfig.mediaUpload.maxFiles;
    const allowedTypes = this.appConfig.mediaUpload.allowedImageTypes;
    const maxSizeMB = this.appConfig.mediaUpload.maxSizeMb;
    const maxSizeInBytes = maxSizeMB * 1024 * 1024;

    const limit = Math.min(files.length, maxFiles - currentPreviews.length);
    if (limit <= 0 && files.length > 0) {
      this.logger.warn(`${this.logPrefix} Maximum image limit (${maxFiles}) reached.`);
      target.value = ''; return;
    }

    const newPreviews: ImagePreview[] = [];
    let processedCount = 0;

    for (let i = 0; i < limit; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type) || file.size > maxSizeInBytes) {
        this.logger.warn(`${this.logPrefix} Skipping invalid file: ${file.name}`);
        processedCount++; if (processedCount === limit) { this.updatePreviewsIfNeeded(newPreviews); }
        continue;
      }

      const reader = new FileReader();
      const previewId = `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`;
      reader.onload = (e: ProgressEvent<FileReader>) => {
        processedCount++;
        if (e.target?.result) {
          newPreviews.push({ file, dataUrl: e.target.result as string, id: previewId });
        }
        if (processedCount === limit) { this.updatePreviewsIfNeeded(newPreviews); }
      };
      reader.onerror = () => {
        processedCount++;
        this.logger.error(`${this.logPrefix} FileReader error for ${file.name}.`);
        if (processedCount === limit) { this.updatePreviewsIfNeeded(newPreviews); }
      };
      reader.readAsDataURL(file);
    }
    target.value = '';
  }

  /** Updates image previews signal. */
  private updatePreviewsIfNeeded(newPreviews: ImagePreview[]): void {
    if (newPreviews.length > 0) {
      this.selectedImagePreviews.update(existing => [...existing, ...newPreviews]);
    }
  }

  /** TrackBy function for image previews. */
  trackImagePreview(index: number, item: ImagePreview): string {
    return item.id;
  }
}
