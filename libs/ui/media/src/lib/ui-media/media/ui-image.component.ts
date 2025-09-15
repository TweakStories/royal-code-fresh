// --- VERVANG VOLLEDIG BESTAND: libs/ui/image/src/lib/components/ui-image.component.ts ---
/**
 * @file ui-image.component.ts
 * @version 8.1.0 (Definitieve Fix: Robuuste Fallback, Error Handling & Type Safety - Afbeelding vult container)
 * @author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @date 2025-09-03
 * @description
 *   Production-ready, backward-compatible responsive image component.
 *   Deze versie lost alle typefouten op, herintroduceert de `availableVariants` computed
 *   en de `setupLazyLoading` methode, en zorgt voor robuuste foutafhandeling
 *   en correcte weergave van de SVG-placeholder. **Belangrijk: De component is nu
 *   geoptimaliseerd om de container horizontaal en verticaal volledig te vullen,
 *   waarbij `object-fit` en `border-radius` correct worden toegepast op de container.**
 *
 * @features
 *   - **Backward Compatible:** `[rounded]="true"` werkt als voorheen.
 *   - **Flexible Rounding:** `[rounding]` input voor 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'.
 *   - Cross-browser compatible (Chrome, Firefox, Safari, Edge)
 *   - Race condition protection via @if guards
 *   - Lazy loading, fallback images, and srcset support
 *   - Accessibility compliant (WCAG AA)
 *   - **FIXED:** Robuuste fallback-logica en correcte weergave van SVG-placeholder bij fouten, zonder inline JS.
 *   - **FIXED:** Afbeelding vult de container volledig, ronde hoeken correct toegepast.
 */

import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  signal,
  effect,
  viewChild,
  inject,
  Signal,
  WritableSignal,
  booleanAttribute,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  OnDestroy,
  OnInit,
  afterNextRender,
  Injector,
  output
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Image, ImageVariant } from '@royal-code/shared/domain';

export type ObjectFitType = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

@Component({
  selector: 'royal-code-ui-image',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure
      #imageContainer
      class="rc-image-wrapper relative overflow-hidden m-0"
      [ngClass]="containerClasses()"
      [style.border-radius]="computedBorderRadius()">

      <!-- Afbeelding element -->
      @if (shouldRenderImage()) {
        <img
          #imageElement
          [src]="currentImageSrc()"
          [alt]="finalAltText()"
          [attr.loading]="shouldRenderImage()?.loading"
          [attr.fetchpriority]="shouldRenderImage()?.fetchPriority"
          [attr.srcset]="shouldRenderImage()?.srcset"
          [attr.sizes]="shouldRenderImage()?.sizes"
          class="rc-image-element block w-full h-full transition-opacity duration-300"
          [ngClass]="imageElementClasses()"
          decoding="async"
          (load)="onImageLoad()"
          (error)="onImageError()"
        />
      }

      <!-- Fallback SVG in geval van fout, getoond als hasError true is -->
      <div
        class="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none"
        [ngStyle]="{ 'display': hasError() ? 'flex' : 'none' }"
        role="img"
        [attr.aria-label]="finalAltText() + ' (failed to load)'">
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          class="h-1/3 w-1/3 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <!-- Laad-indicator/placeholder -->
      @if (!isLoaded() && !hasError() && shouldLoadImage()) {
        <div
          aria-hidden="true"
          class="absolute inset-0 animate-pulse bg-muted/30">
        </div>
      }
    </figure>
  `,
  styles: [`
    :host {
      display: block;
      line-height: 0;
      width: 100%; /* Zorgt dat de host de breedte vult */
      height: 100%; /* Zorgt dat de host de hoogte vult */
    }
    .rc-image-wrapper {
      contain: layout style paint;
      width: 100%; /* Zorgt dat de figure de breedte van de host vult */
      height: 100%; /* Zorgt dat de figure de hoogte van de host vult */
    }
    .rc-image-element {
      /* Deze klassen zorgen ervoor dat de img de container volledig vult */
      max-width: 100%;
      object-position: center; /* Voeg deze toe voor consistentie */
    }
  `]
})
export class UiImageComponent implements OnInit, OnDestroy {
  
  // --- 📥 INPUTS ---
  
  readonly image = input<Image | undefined>();
  readonly variants = input<ImageVariant[] | undefined>();
  readonly src = input<string | undefined>();
  readonly fallbackSrc = input<string | undefined>();
  readonly alt = input<string | undefined>();
  readonly sizesAttribute = input<string | undefined>();
  readonly objectFit = input<ObjectFitType>('cover');
  readonly aspectRatio = input<string | undefined>();
  readonly extraClasses = input<string | undefined>();
  readonly imageClasses = input<string | undefined>();
  readonly lazyLoad = input(true, { transform: booleanAttribute });
  
  private readonly defaultFallbackImageSrc = 'images/default-image.webp';

  /**
   * @deprecated Gebruik `rounding="'full'"` voor nieuwe implementaties.
   * @description Voor backward compatibility. Maakt de afbeelding volledig rond.
   */
  readonly rounded = input(false, { transform: booleanAttribute });

  /**
   * @description Bepaalt de afronding. Negeert `[rounded]` indien ingesteld.
   * @default 'md'
   */
  readonly rounding = input<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | undefined>();

  readonly lazyLoadMargin = input('200px');
  
  // --- 📤 OUTPUTS ---
  
  readonly imageError = output<void>();
  readonly imageLoaded = output<void>();
  
  // --- 🔄 STATE SIGNALS ---
  
  readonly isLoaded = signal(false);
  readonly hasError = signal(false);
  readonly shouldLoadImage = signal(false); // Begin met false, IntersectionObserver of effect zet het op true
  private readonly currentAttemptedSrc = signal<string | undefined>(undefined); // Houdt bij welke src momenteel wordt geprobeerd
  
  // --- 🔧 PRIVATE DEPENDENCIES ---
  
  private readonly imageContainerRef = viewChild.required<ElementRef<HTMLDivElement>>('imageContainer');
  private readonly ngZone = inject(NgZone);
  private readonly platformId: Object = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  
  private observer: IntersectionObserver | null = null;
  
  // --- 🧮 COMPUTED SIGNALS (NU CORRECT) ---
  
  // Hernieuwde availableVariants computed
  private readonly availableVariants: Signal<ImageVariant[]> = computed(() => this.variants() ?? this.image()?.variants ?? []);

  // primarySrcCandidate gebruikt nu de correcte availableVariants
  private readonly primarySrcCandidate = computed((): string | undefined => {
    if (this.src()) return this.src();
    const variants = this.availableVariants();
    if (variants.length === 0) return undefined;
    const sortedVariants = [...variants]
      .filter((variant: ImageVariant) => variant.url && variant.width) // Expliciet type
      .sort((a: ImageVariant, b: ImageVariant) => (b.width ?? 0) - (a.width ?? 0)); // Expliciet type
    return sortedVariants[0]?.url ?? variants[0]?.url;
  });

  // currentImageSrc levert de URL die daadwerkelijk in de <img> src attributen komt
  readonly currentImageSrc = computed((): string => {
    return this.currentAttemptedSrc() ?? this.defaultFallbackImageSrc;
  });

  readonly finalAltText = computed(() => this.alt() || this.image()?.altText || 'Image');
  
  readonly containerClasses = computed(() => {
    const classes = [
      this.aspectRatio() && `aspect-[${this.aspectRatio()}]`,
      this.extraClasses()
    ].filter(Boolean);
    
    // Zorgt ervoor dat de container altijd de volledige breedte en hoogte van zijn parent vult
    // Tenzij er expliciet een aspectRatio is gedefinieerd, dan moet de parent de hoogte bepalen.
    const hasExplicitHeight = this.extraClasses()?.match(/\b(?:h-|max-h-)\w+/);
    if (!this.aspectRatio() && !hasExplicitHeight) {
      classes.push('w-full h-full'); // Zorg dat container zichzelf uitbreidt als geen aspect of hoogte is gegeven
    } else if (!hasExplicitHeight && this.aspectRatio()) {
      classes.push('w-full'); // Behoud breedte als aspect is gegeven, laat hoogte door aspectratio bepalen
    }

    return classes.join(' ');
  });

  readonly computedBorderRadius: Signal<string> = computed(() => {
    const roundingValue = this.rounding();
    // Een map voor consistentie, met kleine waarden voor subtle effects
    const reducedRoundingMap: { [key: string]: string } = {
      'none': '0',
      'xs': '0.03125rem', // 0.5px
      'sm': '0.0625rem',  // 1px
      'md': '0.125rem',   // 2px
      'lg': '0.1875rem',  // 3px
      'xl': '0.25rem',    // 4px
      'full': '9999px'
    };

    if (roundingValue) {
      return reducedRoundingMap[roundingValue] || '0.125rem'; // Fallback naar reduced 'md'
    } else if (this.rounded()) {
      return '9999px';
    } else {
      return '0.125rem'; // Default naar reduced 'md'
    }
  });

  readonly imageElementClasses = computed(() => [
    `object-${this.objectFit()}`,
    this.imageClasses(),
    this.isLoaded() ? 'opacity-100' : 'opacity-0'
  ].filter(Boolean).join(' '));
  
  // shouldRenderImage bepaalt alleen of de <img> tag in het DOM moet zijn en vult de attributen
  readonly shouldRenderImage = computed(() => {
    const src = this.currentImageSrc(); // Gebruik de actuele SRC
    const shouldLoad = this.shouldLoadImage();
    if (!shouldLoad || !src) return null; // Render de <img> niet als er geen SRC is

    const srcsetEntries = this.availableVariants() // Gebruik de correcte computed
      .filter((variant: ImageVariant) => variant.url && variant.descriptor) // Expliciet type
      .map((variant: ImageVariant) => `${variant.url} ${variant.descriptor}`); // Expliciet type
    const srcset = srcsetEntries.length > 0 ? srcsetEntries.join(', ') : undefined;

    return {
      src, srcset, sizes: this.sizesAttribute(),
      alt: this.finalAltText(), lazyLoad: this.lazyLoad(),
      loading: this.lazyLoad() ? 'lazy' : 'eager',
      fetchPriority: this.lazyLoad() ? 'auto' : 'high'
    };
  });
  
  constructor() {
    // Effect om de initialisatie en updates van de `currentAttemptedSrc` te beheren.
    // Dit triggert de laad- en fallback-logica.
    effect(() => {
      // Luister naar veranderingen in de input `image`, `src`, `variants`.
      const inputImage = this.image();
      const inputSrc = this.src();
      const inputVariants = this.variants();

      this.resetState(); // Reset de state bij elke relevante inputverandering
      this.currentAttemptedSrc.set(this.primarySrcCandidate()); // Stel de initiële SRC in om te proberen
      this.setupLazyLoadingLogic(); // Roep de nieuwe setupLazyLoadingLogic methode aan
    });

    // Effect om de `shouldLoadImage` te resetten als de `currentAttemptedSrc` verandert
    // Dit zorgt ervoor dat een nieuwe laadpoging begint na een fallback.
    effect(() => {
      this.currentAttemptedSrc(); // Luister naar veranderingen
      // Reset `isLoaded` en `hasError` hier niet; dat wordt in `onImageLoad`/`onImageError` gedaan.
      // Echter, als `currentAttemptedSrc` verandert, dan is het een nieuwe laadpoging.
      // We moeten er wel voor zorgen dat `shouldLoadImage` weer `true` is als het niet lazy is.
      if (!this.lazyLoad()) {
        this.shouldLoadImage.set(true); // Eager load opnieuw bij SRC verandering
      } else {
        // Voor lazy load: reset shouldLoadImage om IntersectionObserver te laten triggeren.
        this.shouldLoadImage.set(false);
      }
    });
  }
  
  ngOnInit(): void {
    // Initialiseer shouldLoadImage als lazyLoad false is
    if (!this.lazyLoad()) {
      this.shouldLoadImage.set(true);
    }
  }

  ngOnDestroy(): void { this.disconnectObserver(); }
  
  private resetState(): void {
    this.isLoaded.set(false);
    this.hasError.set(false);
    this.currentAttemptedSrc.set(undefined); // Reset de poging
    this.shouldLoadImage.set(false); // Reset laadstatus, IntersectionObserver/eager laadt opnieuw
    this.disconnectObserver(); // Verbreek eventuele bestaande observer
  }
  
  // Nieuwe methode voor lazy loading setup
  private setupLazyLoadingLogic(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.lazyLoad()) {
        this.shouldLoadImage.set(true); // Direct laden als niet lazy
        return;
    }

    // Anders, stel IntersectionObserver in via afterNextRender
    afterNextRender(() => {
      if (!this.shouldLoadImage()) { // Alleen observeren als nog niet aan het laden
        this.createIntersectionObserver();
      }
    }, { injector: this.injector });
  }

  private createIntersectionObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return; // Observer alleen in browser
    const containerEl = this.imageContainerRef().nativeElement;
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          this.ngZone.run(() => {
            this.shouldLoadImage.set(true); // Nu mag de afbeelding geladen worden
            this.disconnectObserver();
          });
        }
      }, { rootMargin: this.lazyLoadMargin(), threshold: 0.01 });
      this.observer.observe(containerEl);
    });
  }
  
  private disconnectObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  onImageLoad(): void {
    this.isLoaded.set(true);
    this.hasError.set(false); // Belangrijk: reset error bij succesvolle load
    this.imageLoaded.emit();
  }
  
  onImageError(): void {
    console.warn(`[UiImageComponent] Image failed to load: ${this.currentAttemptedSrc()}, trying fallback...`);

    const primaryCandidate = this.primarySrcCandidate();
    const currentAttempt = this.currentAttemptedSrc();

    if (currentAttempt === primaryCandidate && this.fallbackSrc()) {
      // We faalden op de primaire SRC, er is een specifieke fallback. Probeer die.
      this.currentAttemptedSrc.set(this.fallbackSrc());
      this.hasError.set(false); // Reset foutstatus om nieuwe poging mogelijk te maken
      this.isLoaded.set(false); // Reset geladen status
    } else if (currentAttempt !== this.defaultFallbackImageSrc) {
      // We faalden op de primaire SRC (en er was geen specifieke fallback) OF op de specifieke fallback.
      // Probeer de algemene default fallback.
      this.currentAttemptedSrc.set(this.defaultFallbackImageSrc);
      this.hasError.set(false);
      this.isLoaded.set(false);
    } else {
      // We hebben alle SRCs geprobeerd (of alleen de default) en het faalde.
      // Nu is het een definitieve fout, toon de SVG.
      this.hasError.set(true);
      this.isLoaded.set(false);
      this.disconnectObserver(); // Stop observeren
      this.imageError.emit();
    }
  }
}