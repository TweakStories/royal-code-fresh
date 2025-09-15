/**
 * @file ui-featured-media-gallery.component.ts
 * @Version 3.2.0 (Fully Accessible)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-19
 * @Description
 *   A robust, definitive, and accessible implementation of the featured media gallery.
 *   This version corrects accessibility linting errors by making clickable elements
 *   focusable and keyboard-operable.
 */
import { Component, ChangeDetectionStrategy, computed, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Media, Image, MediaType } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { UiMediaSliderComponent } from '../ui-media-slider/ui-media-slider.component';
import { UiMediaTruncatedGridComponent } from '../ui-media-truncated-grid/ui-media-truncated-grid.component';
import { UiImageComponent } from '../media/ui-image.component';
import { MediaViewerService } from '../ui-lightbox-viewer/media-viewer.service';

@Component({
  selector: 'royal-code-ui-featured-media-gallery',
  standalone: true,
  imports: [CommonModule, UiMediaSliderComponent, UiMediaTruncatedGridComponent, UiImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="component-wrapper space-y-3">
      @if (images().length > 0) {
        <!-- Case 1: Er is exact één afbeelding -->
        @if (images().length === 1) {
          <div 
            class="aspect-[4/3] rounded-md overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            (click)="openLightbox(images(), 0)"
            (keydown.enter)="openLightbox(images(), 0)"
            tabindex="0"
            role="button"
            [attr.aria-label]="'Bekijk afbeelding ' + (images()[0].altText || 'in groot formaat')">
            <royal-code-ui-image 
              [src]="images()[0].variants[0].url" 
              [alt]="images()[0].altText" 
              objectFit="cover" 
              [lazyLoad]="false" 
              priority="high"
            />
          </div>
        }

        <!-- Case 2: Er zijn meerdere afbeeldingen -->
        @if (images().length > 1) {
          <royal-code-ui-media-slider
            [images]="images()"
            [activeIndex]="activeIndex()"
            (slideChanged)="activeIndex.set($event)"
            (imageClicked)="openLightbox(images(), activeIndex())"
            [loop]="true"
            [aspectRatio]="'4/3'"
            objectFit="cover"
          />
          <royal-code-ui-media-truncated-grid
            [media]="images()"
            [activeIndex]="activeIndex()"
            (itemClick)="activeIndex.set($event)"
            [visibleCount]="5"
            [columns]="5"
          />
        }
      } @else {
        <!-- Fallback als er (nog) geen afbeeldingen zijn -->
        <div class="aspect-[4/3] bg-muted rounded-md flex items-center justify-center">
        </div>
      }
    </div>
  `,
})
export class UiFeaturedMediaGalleryComponent implements OnDestroy {
  private readonly logger = inject(LoggerService, { optional: true });
  private readonly mediaViewerService = inject(MediaViewerService);
  private readonly logPrefix = '[UiFeaturedMediaGallery]';

  readonly allMedia = input.required<Media[] | undefined>();
  readonly activeIndex = signal(0);
  readonly images = computed<Image[]>(() => {
    const media = this.allMedia() ?? []; // Gebruikt nu direct de 'images' input
    return media.filter((m): m is Image => m.type === MediaType.IMAGE);
  });


  constructor() {
    this.logger?.info(`${this.logPrefix} Component instantiated.`);
    effect(() => {
      this.images();
      this.logger?.info(`${this.logPrefix} Effect triggered: 'images' input changed. Resetting index to 0.`);
      this.activeIndex.set(0);
    });
  }

  openLightbox(images: Image[], startIndex: number): void {
    this.logger?.info(`${this.logPrefix} Opening lightbox.`, { count: images.length, start: startIndex });
    this.mediaViewerService.openLightbox(images, startIndex);
  }

  ngOnDestroy(): void {
    this.logger?.info(`${this.logPrefix} Component destroyed.`);
  }
}