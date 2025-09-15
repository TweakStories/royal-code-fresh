// --- VERVANG DE VOLLEDIGE BESTANDSINHOUD ---

/**
 * @file ui-media.component.ts
 * @Version 1.4.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-05-23
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2024-05-23
 * @PromptSummary Corrected type mismatch error by adding a null check before calling type guard functions.
 * @Description A standalone "dispatcher" component that renders the appropriate UI
 *              for any given `Media` object. It uses Angular's `@switch` and `@defer` blocks
 *              to delegate rendering to specialized, lazy-loaded components. This provides a
 *              single, consistent, and performant API for displaying all media types.
 */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import { Media, MediaType, Image, VideoMedia, AudioMedia, DocumentMedia, ArchiveMedia } from '@royal-code/shared/domain';
import { UiImageComponent } from './ui-image.component';
import { UiVideoComponent } from './ui-video.component';
import { UiAudioComponent } from './ui-audio.component';
import { UiDocumentComponent } from './ui-doc.component';

@Component({
  selector: 'royal-code-ui-media',
  standalone: true,
  imports: [
    UiImageComponent,
    UiVideoComponent,
    UiAudioComponent,
    UiDocumentComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Een @if-blok op het hoogste niveau voorkomt errors als de media-input 'undefined' is. -->
    @if (media(); as mediaItem) {
      <!-- @switch is de kern van de dispatcher, gebaseerd op de discriminated union. -->
      @switch (mediaItem.type) {
        @case (MediaType.IMAGE) {
          <royal-code-ui-image [image]="asImage(mediaItem)" />
        }
        @case (MediaType.VIDEO) {
          <!-- @defer laadt de video-component pas als deze in de viewport komt. -->
          @defer (on viewport) {
            <royal-code-ui-video [video]="asVideo(mediaItem)" />
          } @placeholder {
            <div class="flex items-center justify-center w-full h-full min-h-32 p-4 bg-muted rounded-xs text-center text-muted-foreground border border-dashed border-border">
              <span class="animate-pulse">Video wordt geladen...</span>
            </div>
          } @error {
            <div class="flex items-center justify-center w-full h-full min-h-32 p-4 bg-destructive/10 rounded-xs text-center text-destructive-foreground border border-dashed border-destructive/20">
              Kon video component niet laden.
            </div>
          }
        }
        @case (MediaType.AUDIO) {
          @defer (on viewport) {
            <royal-code-ui-audio [audio]="asAudio(mediaItem)" />
          } @placeholder {
            <div class="flex items-center justify-center w-full h-full min-h-32 p-4 bg-muted rounded-xs text-center text-muted-foreground border border-dashed border-border">
              <span class="animate-pulse">Audio wordt geladen...</span>
            </div>
          } @error {
            <div class="flex items-center justify-center w-full h-full min-h-32 p-4 bg-destructive/10 rounded-xs text-center text-destructive-foreground border border-dashed border-destructive/20">
              Kon audio component niet laden.
            </div>
          }
        }
        @case (MediaType.DOCUMENT) {
          @defer (on viewport) {
            <royal-code-ui-document [document]="asDocument(mediaItem)" />
          } @placeholder {
            <div class="flex items-center justify-center w-full h-full min-h-32 p-4 bg-muted rounded-xs text-center text-muted-foreground border border-dashed border-border">
              <span class="animate-pulse">Document wordt geladen...</span>
            </div>
          } @error {
            <div class="flex items-center justify-center w-full h-full min-h-32 p-4 bg-destructive/10 rounded-xs text-center text-destructive-foreground border border-dashed border-destructive/20">
              Kon document component niet laden.
            </div>
          }
        }
        @case (MediaType.ARCHIVE) {
          <!-- Archieven gebruiken dezelfde component als documenten. -->
          @defer (on viewport) {
            <royal-code-ui-document [document]="asArchive(mediaItem)" />
          } @placeholder {
            <div class="flex items-center justify-center w-full h-full min-h-32 p-4 bg-muted rounded-xs text-center text-muted-foreground border border-dashed border-border">
              <span class="animate-pulse">Archief wordt geladen...</span>
            </div>
          } @error {
            <div class="flex items-center justify-center w-full h-full min-h-32 p-4 bg-destructive/10 rounded-xs text-center text-destructive-foreground border border-dashed border-destructive/20">
              Kon archief component niet laden.
            </div>
          }
        }
        @default {
          <!-- Fallback voor 'OTHER' of onbekende types. -->
          <div class="flex items-center justify-center w-full h-full min-h-32 p-4 bg-destructive/10 rounded-xs text-center text-destructive-foreground border border-dashed border-destructive/20">
            <p>Niet-ondersteund media type: {{ mediaItem.type }}</p>
          </div>
        }
      }
    }
  `,
  // De 'styles' array is leeg omdat alle styling in de template met Tailwind is afgehandeld.
  styles: [],
})
export class UiMediaComponent {
  /** Het media object dat weergegeven moet worden. Kan elk type uit de Media union zijn. */
  readonly media = input<Media | null | undefined>();

  /** Exposeert de MediaType enum aan de template voor gebruik in de @switch. */
  protected readonly MediaType = MediaType;

  /**
   * @description Type guard om de compiler te helpen het media-object als `Image` te zien.
   * @param media Het generieke Media-object.
   * @returns Het media-object, gecast als `Image`.
   */
  protected asImage(media: Media): Image {
    return media as Image;
  }

  /**
   * @description Type guard voor `VideoMedia`.
   * @param media Het generieke Media-object.
   * @returns Het media-object, gecast als `VideoMedia`.
   */
  protected asVideo(media: Media): VideoMedia {
    return media as VideoMedia;
  }

  /**
   * @description Type guard voor `AudioMedia`.
   * @param media Het generieke Media-object.
   * @returns Het media-object, gecast als `AudioMedia`.
   */
  protected asAudio(media: Media): AudioMedia {
    return media as AudioMedia;
  }

  /**
   * @description Type guard voor `DocumentMedia`.
   * @param media Het generieke Media-object.
   * @returns Het media-object, gecast als `DocumentMedia`.
   */
  protected asDocument(media: Media): DocumentMedia {
    return media as DocumentMedia;
  }

  /**
   * @description Type guard voor `ArchiveMedia`.
   * @param media Het generieke Media-object.
   * @returns Het media-object, gecast als `ArchiveMedia`.
   */
  protected asArchive(media: Media): ArchiveMedia {
    return media as ArchiveMedia;
  }
}
