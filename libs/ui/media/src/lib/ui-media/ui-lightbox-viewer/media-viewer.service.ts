import { Injectable, inject } from '@angular/core';
import { Media } from '@royal-code/shared/domain';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { LoggerService } from '@royal-code/core/core-logging';
import { LightboxViewerData, UiLightboxViewerComponent } from './ui-lightbox-viewer.component';

@Injectable({ providedIn: 'root' })
export class MediaViewerService {
  private dynamicOverlayService = inject(DynamicOverlayService);
  private logger = inject(LoggerService, { optional: true });

  private isLightboxOpen = false;

  openLightbox(mediaList: readonly Media[], initialIndex = 0): void {
    this.logger?.info('MediaViewerService: openLightbox called', {
      mediaCount: mediaList.length,
      initialIndex,
      isAlreadyOpen: this.isLightboxOpen
    });

    if (this.isLightboxOpen) {
      this.logger?.warn('MediaViewerService: Lightbox already open, ignoring call');
      return;
    }

    if (!mediaList || mediaList.length === 0) {
      this.logger?.error('MediaViewerService: No media provided');
      return;
    }

    if (initialIndex < 0 || initialIndex >= mediaList.length) {
      this.logger?.warn('MediaViewerService: Invalid initialIndex, using 0', { initialIndex, mediaCount: mediaList.length });
      initialIndex = 0;
    }

    this.isLightboxOpen = true;

    try {
      const overlayRef = this.dynamicOverlayService.open<unknown, LightboxViewerData>({
        component: UiLightboxViewerComponent,
        data: {
          lightboxMedia: mediaList,
          startIndex: initialIndex
        },
        panelClass: ['lightbox-overlay-panel', 'w-full', 'h-full'],
        backdropType: 'dark',
        closeOnClickOutside: true,
        disableCloseOnEscape: false,
      });

      this.logger?.info('MediaViewerService: Overlay created successfully');

      overlayRef.afterClosed$.subscribe(result => {
        this.logger?.info('MediaViewerService: Lightbox closed', { result });
        this.isLightboxOpen = false;
      });

    } catch (error) {
      this.logger?.error('MediaViewerService: Error opening lightbox', error);
      this.isLightboxOpen = false;
    }
  }

  resetState(): void {
    this.logger?.info('MediaViewerService: Manually resetting state');
    this.isLightboxOpen = false;
  }

  get isOpen(): boolean {
    return this.isLightboxOpen;
  }
}