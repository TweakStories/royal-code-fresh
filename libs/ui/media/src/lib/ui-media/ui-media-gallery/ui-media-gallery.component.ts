/**
 * @file ui-media-gallery.component.ts
 * @Version 1.1.0 (Type-Safe & Corrected)
 */
import { Component, ChangeDetectionStrategy, inject, input, signal, computed, TemplateRef, OnInit } from '@angular/core';

import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { UiLightboxViewerComponent, LightboxViewerData } from '../ui-lightbox-viewer/ui-lightbox-viewer.component';
import { UiGridComponent } from '@royal-code/ui/grid';
import { Media } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-media-gallery',
  standalone: true,
  imports: [UiGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <royal-code-ui-grid
        [data]="displayedMediaItems()"
        [cellTemplate]="cellTemplate()!"
        [layoutMode]="layoutMode()"
        [maxRows]="maxRows()"
        [maxItems]="computedMaxInitialItems()"
        [minItemWidth]="minItemWidth()"
        [gap]="gap()"
        [distribution]="distribution()"
        (itemClick)="onMediaItemClick($event)">
      </royal-code-ui-grid>
    </div>
  `,
})
export class UiMediaGalleryComponent implements OnInit {
  // --- Inputs ---
  readonly media = input.required<Media[]>();
  readonly maxInitialItems = input<'auto' | number>('auto');
  readonly maxRows = input<'auto' | number>('auto');
  readonly minItemWidth = input<number>(150);
  // FIX: Gebruik een specifiek type voor de template context
  readonly cellTemplate = input<TemplateRef<{ $implicit: Media }>>();
  readonly layoutMode = input<'maxRows' | 'dynamic'>('maxRows');
  readonly gap = input<number>(1);
  readonly distribution = input<'front-loaded' | 'balanced'>('front-loaded');

  // --- Interne State ---
  readonly displayedMediaItems = signal<Media[]>([]);

  // --- Computed ---
  readonly computedMaxInitialItems = computed(() => {
    const max = this.maxInitialItems();
    return max === 'auto' ? this.media().length : max;
  });

  // --- Dependencies ---
  private dynamicOverlayService = inject(DynamicOverlayService);

  ngOnInit(): void {
    this.updateDisplayedMediaItems();
  }

  updateDisplayedMediaItems(): void {
    const itemsToDisplay = this.media().slice(0, this.computedMaxInitialItems());
    this.displayedMediaItems.set(itemsToDisplay);
  }

  onMediaItemClick(item: Media): void {
    const itemIndex = this.media().findIndex(m => m.id === item.id);
    if (itemIndex < 0) return;

    const overlayRef = this.dynamicOverlayService.open<LightboxViewerData>({
        component: UiLightboxViewerComponent,
        data: {
            lightboxMedia: this.media(),
            startIndex: itemIndex
        },
        panelClass: ['lightbox-overlay-panel', 'w-full', 'h-full'],
        backdropType: 'dark',
        closeOnClickOutside: true
    });

    overlayRef.afterClosed$.subscribe(result => {
      console.log('Lightbox closed, result:', result);
    });
  }
}