// libs/features/challenges/src/pages/overview/challenges-overview.component.ts
/**
 * @fileoverview Displays an overview of available challenges, offering both a map view
 *               showing challenge start locations and a list/grid view with challenge summaries.
 *               Includes filtering, sorting, and pagination/infinite scroll capabilities.
 * @Component ChallengesOverviewComponent
 * @description Container component responsible for fetching and displaying challenge start nodes
 *              on a map and/or challenge summaries in a list/grid. Integrates with NodesFacade
 *              for map data and ChallengesFacade (TODO) for list data. Handles user interactions
 *              like view mode switching, filtering, sorting, pagination, and opening the
 *              Node Info Overlay upon marker click.
 * @version 2.1.0 - Changed map markers to use image icons instead of CSS/DivIcon.
 */
import {
  Component,
  OnInit,
  inject,
  signal,
  effect,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel on sort dropdown
import { toSignal } from '@angular/core/rxjs-interop';
import * as L from 'leaflet'; // Import Leaflet

// --- Domain Imports ---
import { AppIcon, NodeSummary, NodeType } from '@royal-code/shared/domain';
import { ChallengeFilters } from '../../models/challenge-filter.model'; // Local filter model
// import { NodeInfoOverlayData } from '@royal-code/shared/domain'; // Data for overlay - No longer needed with service approach

// --- Facade Imports ---
import { INodesFacade } from '@royal-code/shared/domain'; // Interface for Node state interaction.
import { NodesFacade } from '@royal-code/features/nodes'; // For Node Summaries (map markers)
import { ChallengesFacade } from '../../state/challenges.facade'; // For Challenge Summaries (list view) - TODO: Implement fully
import { DynamicOverlayService } from '@royal-code/ui/overlay'; // For opening the overlay

// --- UI Component Imports ---
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiCardComponent, CardTypeEnum } from '@royal-code/ui/cards/card';
import { UiInputComponent } from '@royal-code/ui/input'; // For search
import { UiPaginationComponent } from '@royal-code/ui/pagination'; // For pagination
import { UiRatingComponent } from '@royal-code/ui/rating'; // For displaying rating
import { UiIconComponent } from '@royal-code/ui/icon'; // For icons in markers/buttons
import { NodeChallengeInfoOverlayComponent } from '@royal-code/features/shared/node-challenge'; // Overlay component now in shared library

// --- Core Imports ---
import { LoggerService } from '@royal-code/core/core-logging';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'royal-code-challenges-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // For ngModel
    UiButtonComponent,
    UiCardComponent, // Assuming this is your filter component
    UiIconComponent,
    UiInputComponent,
    UiPaginationComponent,
    UiRatingComponent,
    TranslateModule,
  ],
  template: `
    <div class="p-4">
      <!-- Outer padding -->
      <!-- Search Bar -->
      <div class="mb-4">
        <royal-code-ui-input
          type="search"
          [label]="'common.labels.search' | translate"
          [placeholder]="'challenges.overview.searchPlaceholder' | translate"
          [value]="searchTerm()"
          (changed)="handleSearchTermChange($event)"
        />
        <!-- TODO: Implement search term application logic -->
      </div>

      <!-- Main Layout: Filters Sidebar + Content Area -->
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Filters Sidebar -->
        <aside
          class="w-full md:w-1/4 lg:w-1/5 bg-card rounded-xs shadow p-4 border border-border self-start"
        >
          <h2
            class="text-lg font-semibold mb-4 border-b pb-2 border-border text-foreground"
          >
            {{ 'common.titles.filters' | translate }}
          </h2>
          <!-- TODO: Implement actual filter component and wire up filterConfig$ and handleFilterChange -->
          <p class="text-sm text-secondary italic">
            Filter component placeholder
          </p>
          <!-- Example: <royal-code-ui-filters [filterConfig]="filterConfig()" (filtersChanged)="handleFilterChange($event)" /> -->
          <button
            (click)="applyFilters()"
            class="mt-4 w-full bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm"
          >
            Apply Filters
          </button>
        </aside>

        <!-- Content Area (Map or List) -->
        <main class="w-full md:w-3/4 lg:w-4/5">
          <!-- View Mode Toggle & Sorting Controls -->
          <div
            class="flex flex-col md:flex-row justify-between items-center mb-4 p-3 bg-card rounded-xs shadow border border-border"
          >
            <!-- View Mode Toggle Buttons -->
            <div
              class="mb-3 md:mb-0 flex rounded-md shadow-sm border border-border"
            >
              <royal-code-ui-button
                type="default"
                sizeVariant="sm"
                extraClasses="rounded-r-none !border-r-0"
                [ngClass]="{
                  'bg-primary text-primary-foreground hover:bg-primary/90':
                    viewMode() === 'map',
                  'hover:bg-hover': viewMode() !== 'map'
                }"
                (clicked)="setViewMode('map')"
                [attr.aria-pressed]="viewMode() === 'map'"
              >
                <royal-code-ui-icon
                  [icon]="AppIcon.Map"
                  sizeVariant="sm"
                  extraClass="mr-1"
                />
                Map View
              </royal-code-ui-button>
              <royal-code-ui-button
                type="default"
                sizeVariant="sm"
                extraClasses="!rounded-l-none"
                [ngClass]="{
                  'bg-primary text-primary-foreground hover:bg-primary/90':
                    viewMode() === 'list',
                  'hover:bg-hover': viewMode() !== 'list'
                }"
                (clicked)="setViewMode('list')"
                [attr.aria-pressed]="viewMode() === 'list'"
              >
                <royal-code-ui-icon
                  [icon]="AppIcon.List"
                  sizeVariant="sm"
                  extraClass="mr-1"
                />
                List View
              </royal-code-ui-button>
            </div>
            <!-- Sorting Dropdown -->
            <div class="w-full md:w-auto">
              <label for="sort-select" class="sr-only"
                >{{ 'common.labels.sortBy' | translate }}:</label
              >
              <select
                id="sort-select"
                class="p-1.5 bg-background border border-input rounded-md text-sm text-foreground focus:ring-primary focus:border-primary w-full md:w-auto"
                [ngModel]="filters().sortBy"
                (ngModelChange)="onSortChange($event)"
              >
                <!-- TODO: Add actual sort options based on ChallengeSummary fields -->
                <option value="popularity">
                  {{ 'challenges.overview.sort.popularity' | translate }}
                </option>
                <option value="rating">
                  {{ 'challenges.overview.sort.rating' | translate }}
                </option>
                <option value="newest">
                  {{ 'challenges.overview.sort.newest' | translate }}
                </option>
                <option value="difficulty">
                  {{ 'challenges.overview.sort.difficulty' | translate }}
                </option>
              </select>
            </div>
          </div>

          <!-- === Map View === -->
          @if (viewMode() === 'map') {
          <div
            class="map-container relative h-[60vh] md:h-[70vh] bg-muted rounded-xs shadow border border-border mb-4 overflow-hidden"
          >
            <!-- Loading overlay for map -->
            @if (loadingMapData()) {
            <div
              class="absolute inset-0 bg-background/70 flex items-center justify-center z-10"
            >
              <span class="text-primary animate-pulse"
                >{{ 'common.messages.loadingMap' | translate }}...</span
              >
            </div>
            }
            <!-- Map rendering target div -->
            <div
              #mapElement
              id="challengeMapOverview"
              class="w-full h-full rounded-xs z-0"
            ></div>
          </div>
          }
          <!-- === List View === -->
          @else if (viewMode() === 'list') { @if (loadingListData()) {
          <!-- Separate loading flag for list -->
          <div class="text-center my-6">
            <span class="text-primary animate-pulse"
              >{{ 'common.messages.loadingChallenges' | translate }}...</span
            >
          </div>
          } @if (!loadingListData() && displayedChallengeItems().length > 0) {
          <!-- Grid for Challenge Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (item of displayedChallengeItems(); track item.id) {
            <royal-code-ui-card
              [title]="item.title"
              [description]="item.summary"
              [image]="item.coverImageUrl"
              [cardType]="CardTypeEnum.GridCard"
              marginBottomTitle="2"
              class="cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 duration-200 h-full flex flex-col border border-border bg-card"
              (click)="navigateToChallengeDetails(item.id)"
              (keyup.enter)="navigateToChallengeDetails(item.id)"
              tabindex="0"
              [attr.aria-label]="'View details for challenge ' + item.title"
            >
              <!-- Footer content with rating and difficulty -->
              <div
                card-content-bottom
                class="p-2 mt-auto border-t border-border"
              >
                <div class="flex justify-between items-center">
                  <royal-code-ui-rating
                    [rating]="item.rating"
                    [readonly]="true"
                    size="small"
                  />
                  <span
                    class="text-xs font-medium px-2 py-0.5 rounded bg-accent text-accent-foreground capitalize"
                  >
                    {{ item.difficultyLevel.level || 'N/A' }}
                  </span>
                </div>
              </div>
            </royal-code-ui-card>
            }
          </div>

          <!-- Pagination Controls -->
          <!-- TODO: Wire up pagination logic -->
          @if (listMode() === 'pagination' && totalChallengeCount() >
          (filters().pageSize ?? 9)) {
          <royal-code-ui-pagination
            class="mt-6 flex justify-center"
            [currentPage]="filters().pageNumber ?? 1"
            [pageSize]="filters().pageSize ?? 9"
            [totalItems]="totalChallengeCount()"
            (pageChange)="onPageChange($event)"
          >
          </royal-code-ui-pagination>
          } } @else if (!loadingListData()) {
          <!-- Empty state for list view -->
          <p class="text-secondary col-span-full text-center py-10 italic">
            {{ 'challenges.overview.noChallengesFound' | translate }}
          </p>
          } }
          <!-- End List View -->
        </main>
        <!-- End Content Area -->
      </div>
      <!-- End Main Layout -->
    </div>
    <!-- End Outer Padding -->
  `,
  // --- VERWIJDERDE STYLES ---
  // Verwijder .gamified-marker, .pulsate::before, @keyframes pulsate-glow
  // --- BEHOUDEN STYLES ---
  styles: [
    `
      .leaflet-popup-content-wrapper {
        background-color: var(--color-popover);
        color: var(--color-popover-foreground);
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--color-border);
      }
      .leaflet-popup-content {
        margin: 10px;
        font-size: 13px;
        line-height: 1.4;
      }
      .leaflet-popup-tip {
        background-color: var(--color-popover);
      }
      .leaflet-div-icon {
        background: transparent;
        border: none;
      }
    `,
  ],
})
export class ChallengesOverviewComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  // --- Injected Dependencies ---
  private readonly nodesFacade = inject(NodesFacade) as INodesFacade;
  private readonly challengesFacade = inject(ChallengesFacade); // Assuming this facade exists
  private readonly router = inject(Router);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly logger = inject(LoggerService);

  // --- Constants & Enums ---
  readonly CardTypeEnum = CardTypeEnum;
  readonly AppIcon = AppIcon; // Make icons available
  readonly defaultImage = 'assets/images/default-challenge.jpg';

  // --- State Signals ---
  // Node summaries for the map view
  readonly nodeSummaries = toSignal(this.nodesFacade.nodeSummaries$, {
    initialValue: [],
  });
  readonly loadingMapData = toSignal(this.nodesFacade.loadingSummaries$, {
    initialValue: true,
  });
  readonly nodeError = toSignal(this.nodesFacade.errorSummaries$, {
    initialValue: null,
  }); // Error for nodes

  // Challenge summaries for the list view (replace with actual facade selector)
  readonly displayedChallengeItems = toSignal(
    this.challengesFacade.challengeSummaries$,
    { initialValue: [] }
  );
  readonly loadingListData = toSignal(this.challengesFacade.loadingSummaries$, {
    initialValue: false,
  });
  readonly totalChallengeCount = toSignal(this.challengesFacade.totalItems$, {
    initialValue: 0,
  }); // Gebruik totalItems$
  readonly challengeListError = toSignal(
    this.challengesFacade.errorSummaries$,
    { initialValue: null }
  ); // Gebruik errorSummaries$

  // --- Local UI State ---
  readonly filters = signal<ChallengeFilters>({ pageNumber: 1, pageSize: 9 }); // Default filters for list view
  readonly listMode = signal<'pagination' | 'infinite'>('pagination');
  readonly viewMode = signal<'map' | 'list'>('map'); // Start with map view
  readonly searchTerm = signal<string>('');

  // --- Map Instance & Layers ---
  private map!: L.Map;
  private markersLayer: L.FeatureGroup = L.featureGroup();
  @ViewChild('mapElement') private mapContainer!: ElementRef<HTMLDivElement>;

  /** Log prefix for this component. */
  private readonly logPrefix = '[ChallengesOverviewComponent]';

  private readonly challengeStartIcon = L.icon({
    iconUrl: 'assets/nodes/node-challenge-start.webp', // <<< Pad naar jouw icoon
    iconSize: [32, 32], // <<< Grootte van het icoon (pas aan indien nodig)
    iconAnchor: [16, 32], // <<< Ankerpunt (meestal midden onder)
    popupAnchor: [0, -32], // <<< Waar popup verschijnt t.o.v. anker
    // shadowUrl: '...', // Optioneel: schaduw icoon
    // shadowSize: [41, 41],
    // shadowAnchor: [12, 41]
  });
  // ------------------------------------------

  constructor() {
    effect(() => {
      const summaries = this.nodeSummaries();
      if (this.map && this.viewMode() === 'map') {
        this.logger.debug(
          `${this.logPrefix} Node summaries updated, count: ${summaries.length}. Updating map markers.`
        );
        this.updateMapMarkers(summaries);
      }
    });
  }

  ngOnInit(): void {
    this.logger.info(
      `${this.logPrefix} Initializing. Loading node summaries for map.`
    );
    this.nodesFacade.loadNodeSummaries();
    // Load challenges if starting in list view
    if (this.viewMode() === 'list') {
      this.loadChallengeListData();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 0);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.logger.debug(`${this.logPrefix} Destroying map instance.`);
      this.map.remove();
    }
  }

  private initMap(): void {
    if (this.map || !this.mapContainer?.nativeElement) {
      if (!this.mapContainer?.nativeElement) {
        this.logger.warn(
          `${this.logPrefix} Map container not found during init attempt.`
        );
      }
      return;
    }
    try {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [52.37, 4.89],
        zoom: 7,
        scrollWheelZoom: true,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(this.map);
      this.markersLayer.addTo(this.map);
      this.logger.info(
        `${this.logPrefix} Leaflet map initialized successfully.`
      );
      this.updateMapMarkers(this.nodeSummaries());
    } catch (e) {
      this.logger.error(
        `${this.logPrefix} Failed to initialize Leaflet map:`,
        e
      );
    }
  }

  /** Clears existing markers and adds new markers based on NodeSummary data using image icons. */
  private updateMapMarkers(summaries: ReadonlyArray<NodeSummary>): void {
    if (!this.map || !this.markersLayer) {
      this.logger.warn(
        `${this.logPrefix} Map or markersLayer not ready for update.`
      );
      return;
    }
    this.markersLayer.clearLayers();

    // Filter ONLY for start nodes on this map
    const challengeStartNodes = summaries.filter(
      (s) => s.type === NodeType.START
    );
    this.logger.debug(
      `${this.logPrefix} Rendering ${challengeStartNodes.length} challenge start nodes.`
    );

    challengeStartNodes.forEach((node) => {
      if (!node.location?.coordinates) {
        this.logger.warn(
          `${this.logPrefix} Skipping node ${node.id} due to missing coordinates.`
        );
        return;
      }

      const latLng = L.latLng(
        node.location.coordinates.lat,
        node.location.coordinates.lng
      );

      // --- GEBRUIK HET NIEUWE ICOON ---
      const marker = L.marker(latLng, {
        icon: this.challengeStartIcon, // <<< Gebruik het gedefinieerde icoon
        title: node.title, // Tooltip op hover
      });
      // --------------------------------

      marker.on('click', (e) => {
        this.logger.debug(
          `${this.logPrefix} Marker clicked: Node ID ${node.id}`
        );
        L.DomEvent.stopPropagation(e);
        this.openNodeOverlay(node.id);
      });

      this.markersLayer.addLayer(marker);
    });

    this.fitMapToBounds();
  }


  private fitMapToBounds(): void {
    if (this.markersLayer.getLayers().length > 0) {
      try {
        setTimeout(() => {
          if (this.map && this.markersLayer.getLayers().length > 0) {
            this.map.fitBounds(
              (this.markersLayer as L.FeatureGroup).getBounds().pad(0.1)
            );
          }
        }, 0);
      } catch (e) {
        this.logger.warn(`${this.logPrefix} Could not fit map bounds:`, e);
      }
    }
  }

  setViewMode(mode: 'map' | 'list'): void {
    this.viewMode.set(mode);
    this.logger.info(`${this.logPrefix} View mode changed to: ${mode}`);
    if (mode === 'map') {
      if (this.map) {
        setTimeout(() => {
          this.logger.debug(`${this.logPrefix} Invalidating map size.`);
          this.map.invalidateSize();
          this.fitMapToBounds();
        }, 0);
      } else {
        this.logger.warn(
          `${this.logPrefix} Attempted to invalidate map size, but map not initialized.`
        );
        setTimeout(() => this.initMap(), 50);
      }
    } else {
      if (
        this.displayedChallengeItems().length === 0 &&
        !this.loadingListData()
      ) {
        this.logger.info(
          `${this.logPrefix} Switched to list view, loading challenges.`
        );
        this.loadChallengeListData();
      }
    }
  }

  handleSearchTermChange(
    value: string | number | boolean | FileList | null | undefined
  ): void {
    const term = typeof value === 'string' ? value : '';
    this.searchTerm.set(term);
    this.logger.debug(`${this.logPrefix} Search term changed: ${term}`);
    // TODO: Implement debounce logic before applying filters
    this.applyFilters(); // Apply immediately for now
  }

  onSortChange(value: string | null): void {
    if (value) {
      this.logger.info(`${this.logPrefix} Sort option changed: ${value}`);
      this.filters.update((f) => ({ ...f, sortBy: value, pageNumber: 1 }));
      this.loadChallengeListData();
    }
  }

  handleFilterChange(updatedFilters: Partial<ChallengeFilters>): void {
    this.logger.info(`${this.logPrefix} Filters changed:`, updatedFilters);
    this.filters.update((f) => ({ ...f, ...updatedFilters, pageNumber: 1 }));
    this.loadChallengeListData();
  }

  applyFilters(): void {
    this.logger.info(`${this.logPrefix} Applying filters manually.`);
    this.filters.update((f) => ({ ...f, pageNumber: 1 }));
    this.loadChallengeListData();
  }

  onPageChange(pageNumber: number): void {
    if (this.listMode() === 'pagination') {
      this.logger.info(`${this.logPrefix} Page changed to: ${pageNumber}`);
      this.filters.update((f) => ({ ...f, pageNumber }));
      this.loadChallengeListData();
    }
  }

  private loadChallengeListData(): void {
    const currentFilters = { ...this.filters(), title: this.searchTerm() }; // Voeg zoekterm toe
    this.logger.info(
      `${this.logPrefix} Requesting challenge list data with filters:`,
      currentFilters
    );
    // Gebruik nu de gecombineerde filters
    this.challengesFacade.loadChallengeSummaries(currentFilters);
  }

  navigateToChallengeDetails(challengeId: string | null | undefined): void {
    if (challengeId) {
      this.logger.info(
        `${this.logPrefix} Navigating to challenge details: ${challengeId}`
      );
      this.router.navigate(['/challenges', challengeId]);
    } else {
      this.logger.warn(
        `${this.logPrefix} Cannot navigate to challenge details, ID missing.`
      );
    }
  }

  openNodeOverlay(nodeId: string | null | undefined): void {
    const nodeSummary = this.nodeSummaries().find((n) => n.id === nodeId);
    if (!nodeSummary) {
      this.logger.error(
        `${this.logPrefix} Cannot open overlay, NodeSummary not found for ID: ${nodeId}`
      );
      return;
    }
    this.logger.info(
      `${this.logPrefix} Opening overlay for Node ID: ${nodeId}`
    );
    const overlayData = { nodeId: nodeId ?? '' };
    this.overlayService.open({
      component: NodeChallengeInfoOverlayComponent,
      data: overlayData,
      width: '100%',
      maxWidth: '420px',
      backdropType: 'transparent',
      closeOnClickOutside: true,
      panelClass: ['node-info-overlay-panel'],
      mobileFullscreen: true,
      positionStrategy: 'global-center',
    });
  }
}
