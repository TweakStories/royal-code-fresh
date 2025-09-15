/**
 * @file ui-media-mosaic-grid.component.ts
 * @Version 2.2.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-05-23
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2024-05-23
 * @PromptSummary Final correction of UiMediaMosaicGridComponent, fixing syntax and import paths for a production-ready implementation.
 * @Description A standalone UI component that displays a dynamic mosaic grid of images.
 *              The layout adapts based on the number of images provided (1 to 5+).
 *              This component is specialized to work with an `Image[]` array for simplicity
 *              and robustness, delegating rendering to `UiImageComponent`. It also integrates
 *              with a `MediaViewerService` to open a lightbox.
 */
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  computed,
  Signal,
  InputSignal,
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { AppIcon } from '@royal-code/shared/domain';
import { Image } from '@royal-code/shared/domain';
import { MediaViewerService } from '../ui-lightbox-viewer/media-viewer.service';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiImageComponent } from '../media/ui-image.component';

@Component({
  selector: 'royal-code-ui-media-mosaic-grid',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, UiImageComponent, UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hoofdcontainer die de hoogte en achtergrond beheert. -->
    @if (images()?.length) {
      <div class="overflow-hidden bg-muted" [style.height]="containerHeight()">

        <!-- De @switch past de grid-layout aan op basis van het aantal afbeeldingen. -->
        @switch (imageCount()) {
          @case (1) {
            <div class="grid h-full">
              <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![0], index: 0 }" />
            </div>
          }
          @case (2) {
            <div class="grid grid-cols-2 h-full gap-px">
              <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![0], index: 0 }" />
              <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![1], index: 1 }" />
            </div>
          }
          @case (3) {
            <div class="grid grid-cols-3 h-full gap-px">
              <div class="col-span-2 h-full">
                <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![0], index: 0 }" />
              </div>
              <div class="col-start-3 h-full flex flex-col gap-px">
                <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![1], index: 1, customClasses: 'h-1/2' }" />
                <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![2], index: 2, customClasses: 'h-1/2' }" />
              </div>
            </div>
          }
          @case (4) {
            <div class="grid grid-cols-2 grid-rows-2 h-full gap-px">
              <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![0], index: 0 }" />
              <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![1], index: 1 }" />
              <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![2], index: 2 }" />
              <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![3], index: 3 }" />
            </div>
          }
          @default { <!-- 5 or more items -->
            <div class="flex flex-col h-full gap-px">
              <div class="grid grid-cols-2 gap-px h-2/3">
                <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![0], index: 0 }" />
                <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![1], index: 1 }" />
              </div>
              <div class="grid grid-cols-3 gap-px h-1/3">
                <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![2], index: 2 }" />
                <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![3], index: 3 }" />
                <ng-container *ngTemplateOutlet="thumbnail; context: { $implicit: images()![4], index: 4, showOverlay: true }" />
              </div>
            </div>
          }
        }
      </div>
    } @else {
      <!-- Placeholder die wordt getoond als er geen afbeeldingen zijn. -->
      <div class="flex items-center justify-center bg-muted text-secondary" [style.height]="containerHeight()"></div>
    }
    <ng-template #thumbnail let-image let-index="index" let-showOverlay="showOverlay" let-customClasses="customClasses">
      <div
        class="relative w-full h-full cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm overflow-hidden"
        [ngClass]="customClasses"
        tabindex="0"
        role="button"
        [attr.aria-label]="'Bekijk afbeelding ' + (image.altText || index + 1)"
        (click)="openLightbox(index)"
        (keydown.enter)="openLightbox(index)">

        <royal-code-ui-image
          [image]="image"
          [alt]="image.altText || 'Mozaïek afbeelding ' + (index + 1)"
          objectFit="cover"
          class="w-full h-full transition-transform duration-300 group-hover:scale-105" />

        <!-- Hover overlay met een 'view' icoon. -->
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            @if (!(showOverlay && hiddenItemsCount() > 0)) {
              <royal-code-ui-icon [icon]="AppIcon.Eye" sizeVariant="xl" colorClass="text-white" />
            }
        </div>

        <!-- Overlay die het aantal verborgen items toont (+X). -->
        @if (showOverlay && hiddenItemsCount() > 0) {
          <div class="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-2xl font-bold pointer-events-none">
            +{{ hiddenItemsCount() }}
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class UiMediaMosaicGridComponent {
  /**
   * @description Een array van `Image` objecten om weer te geven in de mozaïek-grid.
   *              De component is gespecialiseerd voor afbeeldingen voor een robuuste en simpele API.
   * @required
   */
  readonly images: InputSignal<Image[] | null | undefined> = input.required<Image[] | null | undefined>();

  /**
   * @description De CSS-hoogte voor de hoofdcontainer van de grid (bv. '30rem', '50vh').
   * @default '30rem'
   */
  readonly containerHeight: InputSignal<string> = input<string>('30rem');

  /** @internal Dependency-injectie voor de MediaViewerService om de lightbox te openen. */
  private readonly mediaViewerService = inject(MediaViewerService);

  /** @internal Exposeert de AppIcon enum aan de template. */
  readonly AppIcon = AppIcon;

  /**
   * @description Berekent het totaal aantal afbeeldingen.
   * @returns {number} Het aantal afbeeldingen, of 0.
   */
  readonly imageCount: Signal<number> = computed(() => this.images()?.length ?? 0);

  /**
   * @description Berekent het aantal afbeeldingen dat niet wordt getoond in de 5+ layout.
   * @returns {number} Het aantal verborgen afbeeldingen.
   */
  readonly hiddenItemsCount: Signal<number> = computed(() => Math.max(0, this.imageCount() - 5));

  /**
   * @description Opent de lightbox-viewer op de geklikte afbeelding.
   * @param {number} index De index van de geklikte afbeelding in de `images` array.
   */
  openLightbox(index: number): void {
    const images = this.images();
    if (images && index >= 0 && index < images.length) {
      // De MediaViewerService verwacht een Media[] array, wat compatibel is met Image[].
      this.mediaViewerService.openLightbox(images, index);
    }
  }
}
