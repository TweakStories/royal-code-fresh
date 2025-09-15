/**
 * @file ui-lightbox-viewer.component.ts
 * @Version 2.5.0 (Keyboard Navigation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-19
 * @Description A full-screen media lightbox viewer. This version adds keyboard
 *              navigation (ArrowLeft, ArrowRight) for enhanced accessibility
 *              and user experience, without losing existing features.
 */
import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy, HostListener, OnInit, Signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon } from '@royal-code/shared/domain';
import { Media, MediaType, Image } from '@royal-code/shared/domain';
import { DYNAMIC_OVERLAY_DATA, DynamicOverlayRef, DYNAMIC_OVERLAY_REF } from '@royal-code/ui/overlay';
import { LoggerService } from '@royal-code/core/core-logging';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiMediaSliderComponent } from '../ui-media-slider/ui-media-slider.component';
import { UiImageComponent } from '../media/ui-image.component';

export interface LightboxViewerData {
  lightboxMedia: readonly Media[];
  startIndex?: number;
}

@Component({
  selector: 'royal-code-ui-lightbox-viewer',
  standalone: true,
  imports: [ CommonModule, TranslateModule, UiImageComponent, UiIconComponent, UiMediaSliderComponent ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[1000]"
      role="dialog" aria-modal="true" tabindex="-1" aria-labelledby="lightbox-title">
      <h2 id="lightbox-title" class="sr-only">{{ 'mediaViewer.title' | translate }}</h2>
      <button type="button" class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1 z-[1001] transition-colors"
        (click)="close()" [title]="'common.buttons.close' | translate" [attr.aria-label]="'common.buttons.close' | translate">
        <royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="xl" />
      </button>
      <div class="flex-1 flex items-center justify-center w-full h-full relative overflow-hidden p-2 sm:p-4">
        @if (images().length > 0) {
          <div class="w-full h-full flex items-center justify-center">
            <royal-code-ui-media-slider
              [images]="images()"
              [activeIndex]="currentIndex()"
              [loop]="true"
              [openInLightboxOnClick]="false"
              objectFit="contain"
              [aspectRatio]="null"
              (slideChanged)="currentIndex.set($event)"
              class="w-full h-full" />
          </div>
        } @else {
           <p class="text-white">{{ 'mediaViewer.noMediaSelected' | translate }}</p>
        }
      </div>
      @if(mediaList().length > 1) {
        <div class="w-full flex justify-center overflow-x-auto mt-auto mb-2 sm:mb-4 space-x-1 sm:space-x-2 px-2 sm:px-4 h-16 sm:h-20 shrink-0"
             role="tablist" [attr.aria-label]="'mediaViewer.thumbnails' | translate">
          @for (item of mediaList(); let i = $index; track trackByFn(i, item)) {
            <button
              type="button"
              class="border-2 h-full aspect-square flex-shrink-0 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-all"
              [class.border-white]="i === currentIndex()"
              [class.border-transparent]="i !== currentIndex()"
              [class.opacity-60]="i !== currentIndex()"
              [class.hover:opacity-100]="i !== currentIndex()"
              (click)="select(i)"
              [attr.aria-label]="('mediaViewer.viewItemN' | translate: { itemTitle: (getAccessibleTitle(item) || (i + 1)) })"
              [attr.aria-selected]="i === currentIndex()"
              role="tab">
              @if(isImage(item)) {
                <royal-code-ui-image
                  class="w-full h-full"
                  [src]="asImage(item).variants[0].url" 
                  [alt]="getAccessibleTitle(item)"
                  objectFit="cover"
                  sizesAttribute="80px" />
              } @else {
                <div class="w-full h-full bg-muted/80 flex items-center justify-center text-secondary">
                  <royal-code-ui-icon [icon]="AppIcon.File" />
                </div>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class UiLightboxViewerComponent implements OnInit, OnDestroy {
  private readonly overlayData: LightboxViewerData | null = inject(DYNAMIC_OVERLAY_DATA, { optional: true });
  private readonly overlayRef = inject<DynamicOverlayRef<unknown, LightboxViewerData>>(DYNAMIC_OVERLAY_REF);
  private readonly logger = inject(LoggerService, { optional: true });
  private readonly logPrefix = '[UiLightboxViewerComponent]';

  readonly mediaList = signal<readonly Media[]>([]);
  readonly currentIndex = signal(0);
  readonly AppIcon = AppIcon;
  readonly images: Signal<Image[]> = computed(() =>
    this.mediaList().filter((item): item is Image => item.type === MediaType.IMAGE)
  );

  constructor() {
    this.logger?.debug(`${this.logPrefix} Constructor: Initializing...`);
    if (this.overlayData?.lightboxMedia) {
      this.mediaList.set(this.overlayData.lightboxMedia);
      this.currentIndex.set(this.overlayData.startIndex ?? 0);
    } else {
      this.logger?.error(`${this.logPrefix} Critical error: No overlay data received!`);
      this.close();
    }
  }

  ngOnInit(): void { this.logger?.debug(`${this.logPrefix} ngOnInit: Component initialized.`); }
  ngOnDestroy(): void { this.logger?.debug(`${this.logPrefix} Destroyed.`); }

  // --- NIEUW: HostListener voor Keyboard Events ---
  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent): void {
    if (this.images().length <= 1) return; // Geen navigatie nodig bij één of geen afbeelding

    switch (event.key) {
      case 'ArrowRight':
        this.next();
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.previous();
        event.preventDefault();
        break;
      case 'Escape':
        this.close();
        event.preventDefault();
        break;
    }
  }

  // --- NIEUW: Navigatie methodes ---
  next(): void {
    const total = this.images().length;
    if (total === 0) return;
    this.currentIndex.update(current => (current + 1) % total);
  }

  previous(): void {
    const total = this.images().length;
    if (total === 0) return;
    this.currentIndex.update(current => (current - 1 + total) % total);
  }

  select(index: number): void {
    if (index >= 0 && index < this.mediaList().length) {
      this.currentIndex.set(index);
    }
  }

  close(result?: unknown): void { this.overlayRef.close(result); }

  trackByFn(index: number, item: Media): string { return item.id ?? `media-item-${index}`; }
  protected isImage(item: Media): item is Image { return item.type === MediaType.IMAGE; }
  protected asImage(item: Media): Image { return item as Image; }
  protected getAccessibleTitle(mediaItem: Media | undefined): string {
    if (!mediaItem) return 'Media item';
    if (this.isImage(mediaItem)) {
      return mediaItem.altText || 'Afbeelding';
    }
    return 'Media content';
  }
}