// --- VERVANG HET VOLGENDE BLOK (de hele @Component decorator en de class) ---

/**
 * @file ui-media-truncated-grid.component.ts
 * @Version 1.3.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-05-23
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2024-05-23
 * @PromptSummary Refactor of UiMediaTruncatedGridComponent for enterprise-level comments and correct integration with the updated UiImageComponent.
 * @Description A standalone UI component that displays a grid of media thumbnails.
 *              It shows a limited number of items and indicates if more are available.
 *              The component handles the active state styling and emits click events,
 *              while delegating the actual image rendering to the robust `UiImageComponent`.
 */
import { ChangeDetectionStrategy, Component, computed, input, output, InputSignal, Signal, OutputEmitterRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Image } from '@royal-code/shared/domain';
import { UiImageComponent } from '../media/ui-image.component';

@Component({
  selector: 'royal-code-ui-media-truncated-grid',
  standalone: true,
  imports: [CommonModule, UiImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- De grid-container die de layout van de thumbnails beheert. -->
    <div
      class="grid gap-2"
      [style.grid-template-columns]="'repeat(' + columns() + ', 1fr)'">

      <!-- Itereert over de zichtbare media-items om de thumbnails te renderen. -->
      @for (item of visibleItems(); track item.id; let i = $index) {
        <button
          (click)="itemClick.emit(i)"
          class="relative cursor-pointer aspect-square bg-muted rounded-md overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          [attr.aria-label]="'Bekijk afbeelding ' + (i + 1)">

          <!-- De UiImageComponent is verantwoordelijk voor het renderen van de daadwerkelijke thumbnail. -->
          <royal-code-ui-image
            class="h-full w-full transition-all duration-200"
            [ngClass]="{'opacity-50 group-hover:opacity-100': i !== activeIndex()}"
            [image]="item"
            [alt]="item.altText || 'Thumbnail ' + (i + 1)"
            objectFit="cover"
            [lazyLoad]="true"
          />

          <!-- Visuele indicator voor het actieve item. -->
          <div
            class="pointer-events-none absolute inset-0 rounded-md border-2 transition-all duration-200"
            [class.border-primary]="i === activeIndex()"
            [class.border-transparent]="i !== activeIndex()">
          </div>

          <!-- Overlay voor de laatste thumbnail die het aantal verborgen items toont. -->
          @if (i === visibleItems().length - 1 && extraCount() > 0) {
            <div
              aria-hidden="true"
              class="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-semibold pointer-events-none rounded-md">
              +{{ extraCount() }}
            </div>
          }
        </button>
      }
    </div>
  `,
})
export class UiMediaTruncatedGridComponent {
  /**
   * @description Een array van `Image` objecten die in de grid moeten worden weergegeven.
   */
  readonly media: InputSignal<Image[]> = input.required<Image[]>();

  /**
   * @description De index van het momenteel actieve item. Dit item krijgt een visuele highlight.
   * @default 0
   */
  readonly activeIndex: InputSignal<number> = input<number>(0);

  /**
   * @description Het aantal kolommen in de grid.
   * @default 5
   */
  readonly columns: InputSignal<number> = input<number>(5);

  /**
   * @description Het maximale aantal media-items dat direct zichtbaar is in de grid.
   * @default 5
   */
  readonly visibleCount: InputSignal<number> = input<number>(5);

  /**
   * @description Wordt geëmit wanneer op een thumbnail wordt geklikt.
   *              De payload is de index van het geklikte item in de originele `media` array.
   */
  readonly itemClick: OutputEmitterRef<number> = output<number>();

  /**
   * @description Berekent de subset van media-items die daadwerkelijk in de DOM worden gerenderd.
   * @returns {Image[]} De array van zichtbare `Image` objecten.
   */
  readonly visibleItems: Signal<Image[]> = computed(() =>
    this.media().slice(0, this.visibleCount())
  );

  /**
   * @description Berekent het aantal media-items dat niet wordt weergegeven.
   *              Dit getal wordt getoond op de laatste zichtbare thumbnail.
   * @returns {number} Het aantal verborgen items.
   */
  readonly extraCount: Signal<number> = computed(() =>
    Math.max(0, this.media().length - this.visibleCount())
  );
}
