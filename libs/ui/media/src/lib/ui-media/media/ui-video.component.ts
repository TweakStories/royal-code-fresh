/**
 * @file ui-video.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-05-23
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2024-05-23
 * @PromptSummary Initial generation of the UiVideoComponent to handle video playback, accepting a VideoMedia domain object.
 * @Description A standalone Angular component for rendering and controlling video playback.
 *              It acts as a robust wrapper around the native HTML5 <video> element,
 *              accepting a `VideoMedia` object and providing standardized inputs for controls
 *              and outputs for playback events.
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  signal,
  OutputEmitterRef,
  output,
  InputSignal,
  booleanAttribute,
  Signal,
  WritableSignal
} from '@angular/core';

import { VideoMedia } from '@royal-code/shared/domain';


@Component({
  selector: 'royal-code-ui-video',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- De container zorgt voor de positionering en de error state. -->
    <div class="relative w-full h-full bg-black rounded-md">
      @if (!hasError()) {
        <video
          class="block w-full h-full object-contain"
          [src]="video().url"
          [poster]="posterUrl()"
          [controls]="controls()"
          [autoplay]="autoplay()"
          [muted]="muted()"
          [loop]="loop()"
          [attr.playsinline]="playsinline() ? '' : null"
          (error)="onVideoError($event)"
          (play)="played.emit()"
          (pause)="paused.emit()"
          (ended)="ended.emit()">
          <!-- Fallback message voor browsers die de <video> tag niet ondersteunen. -->
          Uw browser ondersteunt de video tag niet.
        </video>
      } @else {
        <!-- Toegankelijke error state. -->
        <div
          role="alert"
          class="absolute inset-0 flex flex-col items-center justify-center text-white/70 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-1/4 w-1/4 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span class="text-sm">Kon de video niet laden.</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      line-height: 0;
    }
  `]
})
export class UiVideoComponent {
  /** Het volledige VideoMedia domeinobject dat de URL en metadata bevat. */
  readonly video: InputSignal<VideoMedia> = input.required<VideoMedia>();

  /** Bepaalt of de native browser controls getoond moeten worden. */
  readonly controls = input(true, { transform: booleanAttribute });

  /** Bepaalt of de video automatisch moet afspelen. Let op: de meeste browsers vereisen `muted=true` voor autoplay. */
  readonly autoplay = input(false, { transform: booleanAttribute });

  /** Bepaalt of de video gedempt moet zijn. */
  readonly muted = input(false, { transform: booleanAttribute });

  /** Bepaalt of de video moet herhalen na het einde. */
  readonly loop = input(false, { transform: booleanAttribute });

  /** Zorgt ervoor dat de video inline afspeelt op mobiele apparaten (essentieel voor iOS). */
  readonly playsinline = input(true, { transform: booleanAttribute });

  /** Event dat wordt geëmit wanneer de video niet kan worden geladen. */
  readonly videoError: OutputEmitterRef<Event> = output<Event>();
  /** Event dat wordt geëmit wanneer het afspelen start. */
  readonly played: OutputEmitterRef<void> = output<void>();
  /** Event dat wordt geëmit wanneer het afspelen pauzeert. */
  readonly paused: OutputEmitterRef<void> = output<void>();
  /** Event dat wordt geëmit wanneer de video is afgelopen. */
  readonly ended: OutputEmitterRef<void> = output<void>();

  /** Interne state om bij te houden of er een fout is opgetreden. */
  readonly hasError: WritableSignal<boolean> = signal(false);

  /**
   * @description Bepaalt de URL voor de poster-afbeelding.
   *              Geeft voorrang aan de specifieke `posterImageUrl` van het video-object,
   *              en valt terug op de algemene `thumbnailUrl` van het media-object.
   */
  readonly posterUrl: Signal<string | undefined> = computed(() => {
    const videoData = this.video();
    return videoData.posterImageUrl || videoData.thumbnailUrl;
  });

  /**
   * @description Handler voor het 'error' event van de <video> tag.
   * @param event Het DOM-error event.
   */
  onVideoError(event: Event): void {
    this.hasError.set(true);
    this.videoError.emit(event);
  }
}
