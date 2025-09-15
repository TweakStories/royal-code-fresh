// --- VERVANG DE VOLLEDIGE BESTANDSINHOUD ---

/**
 * @file ui-audio.component.ts
 * @Version 2.1.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-05-23
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2024-05-23
 * @PromptSummary Refactored UiAudioComponent to fix accessibility (a11y) linting errors by adding keyboard support and focusability to the custom progress bar.
 * @Description A standalone Angular component for rendering a custom, accessible audio player.
 *              It hides the native browser controls and provides a fully-styled interface
 *              built with Tailwind CSS and custom UI components. It manages its own
 *              playback state and is fully keyboard-navigable.
 */
import {
  Component, ChangeDetectionStrategy, input, signal, OutputEmitterRef, output,
  InputSignal, booleanAttribute, WritableSignal, viewChild, ElementRef, computed, Signal, effect, untracked
} from '@angular/core';

import { AudioMedia } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain';

import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';

@Component({
  selector: 'royal-code-ui-audio',
  standalone: true,
  imports: [UiIconComponent, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- De container zorgt voor de styling van de audio player wrapper. -->
    <div class="rc-audio-wrapper w-full p-3 bg-muted rounded-xs flex items-center gap-4">
      <!-- Album art -->
      @if (audio().thumbnailUrl) {
        <div class="flex-shrink-0 h-14 w-14">
          <img [src]="audio().thumbnailUrl" alt="Album art for {{ audio().title }}" class="h-full w-full object-cover rounded-md" />
        </div>
      }

      <div class="flex-grow min-w-0 flex items-center gap-4">
        <!-- Play/Pause knop -->
        <royal-code-ui-button
          type="primary"
          sizeVariant="icon"
          [isRound]="true"
          (clicked)="togglePlay()"
          [attr.aria-label]="isPlaying() ? 'Pauzeer audio' : 'Speel audio af'">
          <royal-code-ui-icon [icon]="isPlaying() ? AppIcon.Pause : AppIcon.Play" />
        </royal-code-ui-button>

        <!-- Informatie en progressiebar -->
        <div class="flex-grow min-w-0 space-y-1">
          <p class="font-semibold text-foreground truncate" [title]="audio().title">
            {{ audio().title || 'Onbekende Titel' }}
          </p>

          <!-- Progressiebar en tijd-indicatoren -->
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{{ formatTime(currentTime()) }}</span>
            <div
              #progressBar
              class="relative w-full h-1.5 bg-border rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              (click)="seek($event)"
              (keydown)="handleSeekerKeydown($event)"
              role="slider"
              tabindex="0"
              [attr.aria-valuenow]="currentTime()"
              [attr.aria-valuemin]="0"
              [attr.aria-valuemax]="duration()"
              [attr.aria-valuetext]="'Tijd: ' + formatTime(currentTime())"
              aria-label="Audio voortgangsbalk">
              <div class="absolute h-full bg-primary rounded-full pointer-events-none" [style.width.%]="progressPercentage()"></div>
              <div
                class="absolute w-3.5 h-3.5 bg-white border-2 border-primary rounded-full -top-1 pointer-events-none transition-all"
                [style.left.%]="progressPercentage()"
                style="transform: translateX(-50%);">
              </div>
            </div>
            <span>{{ formatTime(duration()) }}</span>
          </div>
        </div>
      </div>

      <!-- Native <audio> element is verborgen, maar noodzakelijk voor de afspeellogica. -->
      <audio
        #audioElement
        class="hidden"
        [src]="audio().url"
        [loop]="loop()"
        (timeupdate)="onTimeUpdate()"
        (loadedmetadata)="onMetadataLoaded()"
        (ended)="onEnded()"
        (error)="onAudioError($event)">
      </audio>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class UiAudioComponent {
  /** @internal Referentie naar het native audio element. */
  private readonly audioElementRef = viewChild.required<ElementRef<HTMLAudioElement>>('audioElement');
  /** @internal Referentie naar de progressiebar div voor focus management. */
  private readonly progressBarRef = viewChild.required<ElementRef<HTMLDivElement>>('progressBar');

  /**
   * @description Het volledige AudioMedia domeinobject dat de URL en metadata bevat.
   * @required
   */
  readonly audio: InputSignal<AudioMedia> = input.required<AudioMedia>();

  /**
   * @description Bepaalt of het audiobestand automatisch moet afspelen.
   * @default false
   */
  readonly autoplay = input(false, { transform: booleanAttribute });

  /**
   * @description Bepaalt of het audiobestand moet herhalen na het einde.
   * @default false
   */
  readonly loop = input(false, { transform: booleanAttribute });

  /** @description Event dat wordt geëmit wanneer het audiobestand niet kan worden geladen. */
  readonly audioError: OutputEmitterRef<Event> = output<Event>();
  /** @description Event dat wordt geëmit wanneer het afspelen start. */
  readonly playbackStarted: OutputEmitterRef<void> = output<void>();
  /** @description Event dat wordt geëmit wanneer het afspelen pauzeert. */
  readonly playbackPaused: OutputEmitterRef<void> = output<void>();
  /** @description Event dat wordt geëmit wanneer het audiobestand is afgelopen. */
  readonly playbackEnded: OutputEmitterRef<void> = output<void>();
  /** @description Event dat wordt geëmit wanneer de metadata (duur, etc.) is geladen. */
  readonly metadataLoaded: OutputEmitterRef<void> = output<void>();

  /** @internal State signalen voor de UI. */
  readonly isPlaying: WritableSignal<boolean> = signal(false);
  readonly duration: WritableSignal<number> = signal(0);
  readonly currentTime: WritableSignal<number> = signal(0);

  /** @internal Exposeert de AppIcon enum aan de template. */
  protected readonly AppIcon = AppIcon;

  constructor() {
    // Effect om autoplay te beheren.
    effect(() => {
      // Gebruik afterNextRender om zeker te weten dat de view en audioElementRef beschikbaar zijn.
      if (this.autoplay() && !untracked(this.isPlaying)) {
        this.audioElementRef().nativeElement.play().catch(e => console.warn('Autoplay was blocked by the browser.'));
      }
    });
  }

  /**
   * @description Berekent het voortgangspercentage voor de progressiebar.
   * @returns {number} Het percentage (0-100).
   */
  readonly progressPercentage: Signal<number> = computed(() => {
    const dur = this.duration();
    const time = this.currentTime();
    return (dur > 0) ? (time / dur) * 100 : 0;
  });

  /**
   * @description Start of pauzeert het afspelen.
   */
  togglePlay(): void {
    const audioEl = this.audioElementRef().nativeElement;
    if (this.isPlaying()) {
      audioEl.pause();
      this.isPlaying.set(false);
      this.playbackPaused.emit();
    } else {
      audioEl.play().then(() => {
        this.isPlaying.set(true);
        this.playbackStarted.emit();
      });
    }
  }

  /**
   * @description Navigeert naar een specifiek punt in het audiobestand via een muisklik.
   * @param {MouseEvent} event Het klik-event op de progressiebar.
   */
  seek(event: MouseEvent): void {
    const progressBar = event.currentTarget as HTMLElement;
    const clickPosition = event.offsetX;
    const barWidth = progressBar.offsetWidth;
    const seekTime = (clickPosition / barWidth) * this.duration();
    this.updateCurrentTime(seekTime);
  }

  /**
   * @description Verwerkt toetsenbordinteractie voor de progressiebar voor toegankelijkheid.
   * @param {KeyboardEvent} event Het keydown event.
   */
  handleSeekerKeydown(event: KeyboardEvent): void {
    const seekStep = 5; // Verspringt 5 seconden
    switch (event.key) {
      case 'ArrowRight':
        this.updateCurrentTime(this.currentTime() + seekStep);
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.updateCurrentTime(this.currentTime() - seekStep);
        event.preventDefault();
        break;
      case 'Home':
        this.updateCurrentTime(0);
        event.preventDefault();
        break;
      case 'End':
        this.updateCurrentTime(this.duration());
        event.preventDefault();
        break;
    }
  }

  /** @internal Update de `currentTime` state tijdens het afspelen. */
  onTimeUpdate(): void {
    this.currentTime.set(this.audioElementRef().nativeElement.currentTime);
  }

  /** @internal Update de `duration` state wanneer de metadata is geladen. */
  onMetadataLoaded(): void {
    this.duration.set(this.audioElementRef().nativeElement.duration);
    this.metadataLoaded.emit();
  }

  /** @internal Reset de state wanneer de audio is afgelopen. */
  onEnded(): void {
    this.isPlaying.set(false);
    this.currentTime.set(0);
    this.playbackEnded.emit();
  }

  /** @internal Handler voor laadfouten. */
  onAudioError(event: Event): void {
    // Hier zou je een error state kunnen zetten om een foutmelding te tonen.
    this.audioError.emit(event);
  }

  /**
   * @description Formatteert tijd in seconden naar een `mm:ss` string.
   * @param {number} seconds De tijd in seconden.
   * @returns {string} De geformatteerde tijd.
   */
  protected formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return `${minutes}:${formattedSeconds}`;
  }

  /** @internal Helper-methode om de tijd bij te werken en te zorgen dat deze binnen de grenzen blijft. */
  private updateCurrentTime(newTime: number): void {
    const clampedTime = Math.max(0, Math.min(newTime, this.duration()));
    this.audioElementRef().nativeElement.currentTime = clampedTime;
    this.currentTime.set(clampedTime);
  }
}
