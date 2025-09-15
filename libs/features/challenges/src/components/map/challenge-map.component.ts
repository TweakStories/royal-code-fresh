// libs/features/challenges/src/components/map/challenge-map.component.ts
/**
 * @fileoverview Displays a Leaflet map specifically for a single challenge route,
 * showing the route polyline and markers for different node types along the route.
 * @Component ChallengeMapComponent
 * @description This component takes a 'Route' object as input and renders it on a map.
 *              It plots the route's tracking points as a polyline and its nodes as
 *              type-specific image markers.
 * @version 1.0.0 - Initial implementation with type-specific node icons.
 */
import {
  Component, AfterViewInit, OnChanges, SimpleChanges, input, inject,
  ChangeDetectionStrategy, OnDestroy, ElementRef, viewChild,
  ViewChild
} from '@angular/core';
import * as L from 'leaflet';

import { NodeFull, Route, NodeType } from '@royal-code/shared/domain'; // Ensure NodeType is imported
import { LoggerService } from '@royal-code/core/core-logging';

@Component({
  selector: 'royal-code-challenge-map', // Consistent selector prefix
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Ensure the map container div always exists for Leaflet to attach to -->
    <div #mapElement [style.height]="mapHeight()" class="w-full rounded-xs overflow-hidden border border-border"></div>
  `,
  // No specific styles needed here if Leaflet's CSS is globally imported
})
export class ChallengeMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  // --- Inputs ---
  /** The route data to display on the map. */
  readonly route = input<Route | undefined | null>();
  /** The desired height of the map container (e.g., '300px', '50vh'). */
  readonly mapHeight = input<string>('350px'); // Default height

  // --- View Child ---
  @ViewChild('mapElement') private mapContainer!: ElementRef<HTMLDivElement>;

  // --- Dependencies ---
  private logger = inject(LoggerService);
  private readonly logPrefix = '[ChallengeMapComponent]';

  // --- Leaflet Instance & Layers ---
  private map?: L.Map; // Optional because it's initialized in AfterViewInit
  private routeLayer = L.featureGroup(); // Group for all route-related elements (polyline, markers)

  // --- Icon Definitions ---
  // Centralized icon definitions for different node types.
  // Paths are relative to the assets folder in the built application.
  private readonly iconRegistry: Map<NodeType, L.Icon<L.IconOptions>> = new Map([
    [NodeType.START, L.icon({
        iconUrl: 'assets/nodes/node-challenge-start.webp',
        iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
    })],
    [NodeType.FINISH, L.icon({
        iconUrl: 'assets/nodes/node-finish.webp',
        iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
    })],
    [NodeType.CHECKPOINT, L.icon({
        iconUrl: 'assets/nodes/node-checkpoint.webp',
        iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28]
    })],
    [NodeType.POI, L.icon({
        iconUrl: 'assets/nodes/node-poi.webp',
        iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28]
    })],
    [NodeType.QUEST, L.icon({
        iconUrl: 'assets/nodes/node-quest.webp',
        iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28]
    })],
    // Voeg hier andere NodeType => L.Icon mappings toe
    [NodeType.UNKNOWN, L.icon({ // Fallback
        iconUrl: 'assets/nodes/node-default.webp',
        iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24]
    })]
  ]);

  /**
   * @Lifecycle ngAfterViewInit
   * Initializes the Leaflet map after the component's view (and map container) is ready.
   */
  ngAfterViewInit(): void {
    this.logger.debug(`${this.logPrefix} ngAfterViewInit called.`);
    // Delay map initialization slightly to ensure the container is fully rendered
    setTimeout(() => this.initMap(), 0);
  }

  /**
   * @Lifecycle OnChanges
   * Responds to changes in input properties, primarily `route` or `mapHeight`.
   * If the map is initialized, it invalidates its size (for height changes)
   * and re-renders the map content (for route changes).
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.logger.debug(`${this.logPrefix} ngOnChanges called.`, changes);
    if (this.map) {
      if (changes['mapHeight'] && !changes['mapHeight'].firstChange) {
        this.logger.debug(`${this.logPrefix} Map height changed, invalidating size.`);
        // Delay invalidateSize to allow DOM to update if height was changed by parent
        setTimeout(() => this.map?.invalidateSize(), 0);
      }
      if (changes['route'] && !changes['route'].firstChange) {
        this.logger.debug(`${this.logPrefix} Route input changed, re-rendering map content.`);
        this.renderMapContent();
      }
    }
  }

  /**
   * @Lifecycle ngOnDestroy
   * Cleans up the Leaflet map instance to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.logger.debug(`${this.logPrefix} ngOnDestroy called.`);
    this.map?.remove();
    this.map = undefined;
  }

  /**
   * Initializes the Leaflet map: creates the map instance, adds the tile layer,
   * and adds the feature group for route elements.
   * @private
   */
  private initMap(): void {
    if (this.map || !this.mapContainer?.nativeElement) {
      this.logger.warn(`${this.logPrefix} Map already initialized or container not found.`);
      return;
    }
    try {
      this.map = L.map(this.mapContainer.nativeElement, {
        // Default center/zoom, will be overridden by fitBounds later
        center: [51.505, -0.09], // Default, e.g., London
        zoom: 13,
        scrollWheelZoom: true, // Allow scroll wheel zoom
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19, // Standard max zoom for OpenStreetMap
      }).addTo(this.map);

      this.routeLayer.addTo(this.map); // Add the layer group to the map
      this.logger.info(`${this.logPrefix} Leaflet map initialized successfully.`);

      // Render content if route is already available
      if (this.route()) {
          this.renderMapContent();
      }

    } catch (e) {
      this.logger.error(`${this.logPrefix} Failed to initialize Leaflet map:`, e);
    }
  }

  /**
   * Clears the existing route layer and re-renders the current route (polyline and nodes).
   * Fits the map bounds to the new route elements.
   * @private
   */
  private renderMapContent(): void {
    if (!this.map) {
      this.logger.warn(`${this.logPrefix} Attempted to render map content, but map is not initialized.`);
      return;
    }
    this.routeLayer.clearLayers(); // Clear previous route and markers
    const currentRoute = this.route();

    if (currentRoute && (currentRoute.trackingPoints?.length || currentRoute.nodes?.length)) {
      this.logger.debug(`${this.logPrefix} Rendering route:`, currentRoute);

      // Plot the route polyline
      if (currentRoute.trackingPoints && currentRoute.trackingPoints.length > 0) {
        const coords: L.LatLngTuple[] = currentRoute.trackingPoints.map(tp => [tp.lat, tp.lng]);
        L.polyline(coords, {
          color: 'var(--color-primary)', // Use theme variable
          weight: 4,
          opacity: 0.85
        }).addTo(this.routeLayer);
      }

      // Plot the nodes with specific icons
      if (currentRoute.nodes && currentRoute.nodes.length > 0) {
        this.plotNodes(currentRoute.nodes);
      }

      // Fit map bounds to the route layer if it has content
      if (this.routeLayer.getLayers().length > 0) {
        // Use a small timeout to ensure bounds are calculated correctly after layers are added
        setTimeout(() => {
            if (this.map && this.routeLayer.getLayers().length > 0) { // Re-check map existence
                try {
                    this.map.fitBounds(this.routeLayer.getBounds().pad(0.1)); // Add slight padding
                } catch (e) {
                    this.logger.warn(`${this.logPrefix} Could not fit map to bounds:`, e);
                }
            }
        }, 50);
      }
    } else {
      this.logger.debug(`${this.logPrefix} No route data or empty route to render.`);
      // Optional: Set a default view if no route (e.g., based on user location or a default area)
      // this.map.setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);
    }
  }

  /**
   * Iterates through the nodes of the current route and adds them as markers to the map.
   * Uses the `iconRegistry` to select the appropriate icon based on `node.type`.
   * @param nodes - An array of `NodeFull` objects to plot.
   * @private
   */
  private plotNodes(nodes: NodeFull[]): void {
    nodes.forEach(node => {
      if (!node.location?.coordinates) {
        this.logger.warn(`${this.logPrefix} Skipping node ${node.id}: missing coordinates.`);
        return;
      }

      const { lat, lng } = node.location.coordinates;
      const latLng = L.latLng(lat, lng);

      const iconToUse = this.iconRegistry.get(node.type) ?? this.iconRegistry.get(NodeType.UNKNOWN)!;

      const marker = L.marker(latLng, {
        icon: iconToUse,
        title: node.title || 'Map Node'
      }).addTo(this.routeLayer);

      marker.bindPopup(`<b>${node.title || 'Node'}</b><br>Type: ${node.type}`);
    });
  }
}
