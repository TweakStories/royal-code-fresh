// libs/features/social/src/lib/components/gif-picker/gif-picker.component.ts
/**
 * @fileoverview Component for searching and selecting GIFs using the Giphy API (or mock data).
 * Intended for use within a dynamic overlay. Provides search functionality with debouncing
 * and returns the selected GIF URL.
 * @version 1.1.1 - Corrected UiImageComponent binding to use [fallbackSrc].
 * @path libs/features/social/src/lib/components/gif-picker/gif-picker.component.ts
 */
import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DYNAMIC_OVERLAY_REF, DynamicOverlayRef } from '@royal-code/ui/overlay';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { HttpClient } from '@angular/common/http';
import { Subject, of, Observable } from 'rxjs';
import { debounceTime, switchMap, catchError, distinctUntilChanged, takeUntil, tap, finalize, delay } from 'rxjs/operators';
import { LoggerService } from '@royal-code/core/core-logging';
import { TranslateModule } from '@ngx-translate/core';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { MediaType } from '@royal-code/shared/domain';
import { UiImageComponent } from '@royal-code/ui/image';

/** Simplified interface for Giphy API image formats. */
interface GiphyImageFormat {
  url: string;
  width?: string;
  height?: string;
}
/** Simplified interface for a single Giphy search/trending result. */
interface GiphyResult {
  id: string;
  title: string;
  images: {
    fixed_height_small: GiphyImageFormat; // For preview grid
    original: GiphyImageFormat;           // For selection result
  };
}
/** Simplified interface for the Giphy API response structure. */
interface GiphyApiResponse {
    data: GiphyResult[];
    pagination?: { total_count: number; count: number; offset: number; };
    meta?: { status: number; msg: string; response_id: string; };
}

@Component({
  selector: 'lib-gif-picker',
  standalone: true,
  imports: [FormsModule, UiInputComponent, UiImageComponent, UiButtonComponent, TranslateModule, UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="gif-picker-wrapper bg-popover text-popover-foreground md:rounded-xs shadow-lg border md:border border-border w-full flex flex-col h-full">
<!-- Header: Wordt sticky op mobiel -->
  <header class="sticky top-0 z-10 bg-popover p-4 border-b border-border flex items-center justify-center relative flex-shrink-0">
     <!-- Back Button (links, alleen mobiel) -->
     <royal-code-ui-button
         type="transparent"
         sizeVariant="icon"
         (clicked)="closeOverlay()"
         [title]="'common.buttons.back' | translate"
         extraClasses="absolute top-1/2 left-4 -translate-y-1/2 -ml-1 md:hidden">
         <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" sizeVariant="md"/>
     </royal-code-ui-button>
     <!-- Title (gecentreerd) -->
    <h3 class="text-lg font-semibold text-center">
      {{ 'social.picker.searchGif' | translate }}
    </h3>
  </header>

  <!-- Search Input Container: Wordt ook sticky, direct onder de header -->
   <div class="bg-popover px-4 py-2 border-b border-border flex-shrink-0">
     <royal-code-ui-input
       label=""
       [placeholder]="'common.placeholders.search' | translate"
       type="search"
       [value]="searchTerm()"
       (changed)="searchTerms$.next($event.toString())" />
  </div>

  <!-- Loading/Results Area: Dit deel wordt scrollbaar -->
  <div class="flex-grow overflow-y-auto p-4">
    @if (isLoading()) {
      <div class="flex items-center justify-center text-secondary italic pt-10">
        {{ 'common.messages.loading' | translate }}
      </div>
    } @else {
      <div class="gif-grid grid grid-cols-2 sm:grid-cols-3 gap-1">
        @for (gif of searchResults(); track gif.id) {
          <royal-code-ui-button
            type="none"
            sizeVariant="none"
            (clicked)="selectGif(gif.images.original.url)"
            [title]="gif.title"
            [attr.aria-label]="'Select GIF: ' + gif.title"
            extraClasses="aspect-w-1 aspect-h-1 relative group focus:outline-none focus:ring-2 focus:ring-primary rounded-md overflow-hidden p-0">
            <royal-code-ui-image
              [image]="{ id: gif.id, type: MediaType.IMAGE, altText: gif.title, variants: [{ url: gif.images.fixed_height_small.url }] }"
              objectFit="cover"
              class="w-full h-full group-hover:opacity-75 transition-opacity" />
          </royal-code-ui-button>
        }
        @if (!isLoading() && searchResults().length === 0 && searchTerm()) { <p class="col-span-full text-center text-secondary py-4"> {{ 'social.picker.noGifsFound' | translate: { term: searchTerm() } }} </p> }
        @if (!isLoading() && searchResults().length === 0 && !searchTerm()) { <p class="col-span-full text-center text-secondary py-4"> {{ 'social.picker.startTyping' | translate }} </p> }
      </div>
    }
  </div>
</div>
`,
  styles: [` :host { display: block; } `]
})
export class GifPickerComponent implements OnInit, OnDestroy {
  public readonly AppIcon = AppIcon;
  private readonly overlayRef = inject<DynamicOverlayRef<string>>(DYNAMIC_OVERLAY_REF);
  private readonly logger = inject(LoggerService);
  private readonly destroy$ = new Subject<void>();
  MediaType = MediaType;

  private readonly GIPHY_API_KEY = 'YOUR_GIPHY_API_KEY_HERE'; // TODO: Replace placeholder
  private readonly GIPHY_SEARCH_URL = 'https://api.giphy.com/v1/gifs/search';
  private readonly GIPHY_TRENDING_URL = 'https://api.giphy.com/v1/gifs/trending';
  private readonly logPrefix = '[GifPickerComponent]';

  readonly searchTerm = signal('');
  readonly searchResults = signal<GiphyResult[]>([]);
  readonly isLoading = signal(false);
  readonly searchTerms$ = new Subject<string>();

  ngOnInit(): void {
    this.logger.debug(`${this.logPrefix} Initializing.`);
    this.fetchGifs(this.GIPHY_TRENDING_URL, true);

    this.searchTerms$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(term => this.searchTerm.set(term)),
      switchMap(term => {
        const trimmedTerm = term.trim();
        this.searchResults.set([]);
        const url = trimmedTerm
            ? `${this.GIPHY_SEARCH_URL}?api_key=${this.GIPHY_API_KEY}&q=${encodeURIComponent(trimmedTerm)}&limit=24&rating=g`
            : this.GIPHY_TRENDING_URL + `?api_key=${this.GIPHY_API_KEY}&limit=24&rating=g`;
        return this.fetchGifs(url, !trimmedTerm);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.logger.debug(`${this.logPrefix} Destroying.`);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchGifs(url: string, isTrending: boolean): Observable<GiphyResult[]> {
    this.isLoading.set(true);
    this.logger.debug(`${this.logPrefix} Fetching GIFs from: ${url}`);

    // --- MOCK Data Block ---
    console.warn(`${this.logPrefix} Using MOCK GIF data. Replace with actual API call.`);
    const term = this.searchTerm();
    const mockGifs: GiphyResult[] = Array.from({ length: term ? 12 : 18 }).map((_, i) => ({
        id: `mockgif-${term || 'trending'}-${i}`,
        title: `${term || 'Trending'} Mock GIF ${i+1}`,
        images: {
            fixed_height_small: { url: `https://picsum.photos/100/100?random=${i}&search=${term}&blur=1` },
            original: { url: `https://picsum.photos/300/200?random=${i}&search=${term}` }
        }
    }));

    // Gebruik een kleine timeout om de loading state te simuleren
    return of(mockGifs).pipe(
        delay(500), // Simuleer netwerklatentie
        tap(gifs => {
            this.searchResults.set(gifs);
            this.isLoading.set(false);
            this.logger.info(`${this.logPrefix} Received ${gifs.length} MOCK ${isTrending ? 'trending' : 'search result'} GIFs.`);
        }),
        catchError(err => {
            this.logger.error(`${this.logPrefix} Error in MOCK fetchGifs stream:`, err);
            this.isLoading.set(false);
            this.searchResults.set([]);
            return of([]);
        }),
        finalize(() => {
            // Ensure loading is false even if an error occurs before tap/map
            if (this.isLoading()) {
                this.isLoading.set(false);
            }
        })
    );
  }

  selectGif(gifUrl: string): void {
    this.logger.info(`${this.logPrefix} GIF selected: ${gifUrl}`);
    this.overlayRef.close(gifUrl);
  }

  closeOverlay(){
    this.overlayRef.close();
  }
}
