/**
 * @file ui-media-collection.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-05-23
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2024-05-23
 * @PromptSummary Initial generation of the UiMediaCollectionComponent, acting as a layout orchestrator for media arrays.
 * @Description A standalone "orchestrator" component that displays a collection of media
 *              items in a specified layout. It accepts a generic `Media[]` array and an
 *              input to define the layout (e.g., 'mosaic'). Internally, it filters the
 *              data as needed and delegates rendering to specialized layout components
 *              like `UiMediaMosaicGridComponent`.
 */
import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  Signal,
  InputSignal,
} from '@angular/core';

import { Media, Image, MediaType } from '@royal-code/shared/domain';
import { UiMediaMosaicGridComponent } from '../ui-media/ui-media-mosaic-grid/ui-media-mosaic-grid.component';

/**
 * @type MediaCollectionLayout
 * @description Defines the available layout types for the media collection.
 */
export type MediaCollectionLayout = 'mosaic' | 'list' | 'carousel';

@Component({
  selector: 'royal-code-ui-media-collection',
  standalone: true,
  imports: [UiMediaMosaicGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- De @switch kiest de juiste layout-component op basis van de 'layout' input. -->
    @switch (layout()) {
      @case ('mosaic') {
        <!-- Voor de mozaïek-layout, geven we alleen de gefilterde afbeeldingen door. -->
        @if (imageMedia().length > 0) {
          <royal-code-ui-media-mosaic-grid
            [images]="imageMedia()"
            [containerHeight]="containerHeight()"
          />
        }
      }
      @case ('list') {
        <!-- Placeholder voor een toekomstige lijst-layout -->
        <div class="p-4 bg-muted rounded-xs border border-dashed border-border">
          <p class="text-muted-foreground">List layout is nog niet geïmplementeerd.</p>
        </div>
      }
      @case ('carousel') {
        <!-- Placeholder voor een toekomstige carousel-layout -->
        <div class="p-4 bg-muted rounded-xs border border-dashed border-border">
          <p class="text-muted-foreground">Carousel layout is nog niet geïmplementeerd.</p>
        </div>
      }
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class UiMediaCollectionComponent {
  /**
   * @description Een array van `Media` objecten om weer te geven. Accepteert alle types.
   * @required
   */
  readonly media: InputSignal<ReadonlyArray<Media> | null | undefined> = input.required<ReadonlyArray<Media> | null | undefined>();

  /**
   * @description Het type layout dat gebruikt moet worden voor de collectie.
   * @default 'mosaic'
   */
  readonly layout: InputSignal<MediaCollectionLayout> = input<MediaCollectionLayout>('mosaic');

  /**
   * @description De CSS-hoogte voor de container, relevant voor layouts zoals 'mosaic'.
   * @default 'auto'
   */
  readonly containerHeight: InputSignal<string> = input<string>('auto');

  /**
   * @internal Een computed signal dat de `media` array filtert en alleen `Image` objecten retourneert.
   *           Dit is nodig voor gespecialiseerde child-componenten zoals de mozaïek-grid.
   * @returns {Image[]} Een array die alleen `Image` objecten bevat.
   */
  protected readonly imageMedia: Signal<Image[]> = computed(() => {
    const mediaList = this.media();
    if (!mediaList) {
      return [];
    }
    return mediaList.filter((item): item is Image => item.type === MediaType.IMAGE);
  });
}
