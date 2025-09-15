import {
  Component, AfterViewInit, OnDestroy, ChangeDetectionStrategy,
  inject, input, signal, effect,
  OnInit, DestroyRef, // DestroyRef voor takeUntilDestroyed
  WritableSignal
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import * as BABYLON from '@babylonjs/core';

import { Router } from '@angular/router';
import { merge, fromEvent, of } from 'rxjs'; // fromEvent voor map
import { tap, debounceTime, catchError, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NodeSummary, NodeType } from '@royal-code/shared/domain';

import { NodesFacade } from '../../state/nodes.facade';
import { NodesService } from '../../services/nodes.service';


@Component({
  selector: 'lib-node-overview-map',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-[calc(100vh-var(--header-height,4rem))]">
      <div id="map" class="flex-grow bg-gray-200 h-full"></div>

      @if (true || showSidebar()) {
        <div class="w-full md:w-1/3 lg:w-1/4 p-4 overflow-y-auto border-l border-[var(--color-border)] bg-background text-text h-full">
          <h2 class="text-lg font-semibold mb-4 text-primary border-b pb-2 border-[var(--color-border)]">
            Nodes in Viewport
          </h2>
          @if (loading()) {
             <p class="text-secondary italic">Laden...</p>
          } @else if (visibleNodes().length > 0) {
            <div class="space-y-2">
              @for (node of visibleNodes(); track node.id) {
                <div
                  class="p-3 bg-card-primary rounded-xs cursor-pointer hover:bg-card-secondary transition-colors"
                  (click)="navigateToNodeDetail(node.id)"
                  (keyup.enter)="navigateToNodeDetail(node.id)"
                  tabindex="0"
                  [attr.aria-label]="'Details voor ' + node.title">
                  <h3 class="text-md font-medium text-text">{{ node.title }}</h3>
                  <div class="flex justify-between items-center mt-1">
                     <span class="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">{{ node.type }}</span>
                     <!-- <royal-code-ui-rating [rating]="node.rating" [readonly]="true" size="small"></royal-code-ui-rating> -->
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="text-secondary italic">Zoom in of pan de kaart om nodes te zien.</p>
          }
        </div>
      }
    </div>
  `,
})
export class NodeOverviewMapComponent implements AfterViewInit, OnDestroy, OnInit {
  readonly showSidebar = input<boolean>(true);

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private nodeFacade = inject(NodesFacade);
  private nodesService = inject(NodesService);

  readonly allSummaries: WritableSignal<NodeSummary[]> = signal([]); // Gebruik signal()
  readonly loading = signal<boolean>(true);                      // Gebruik signal()
  readonly visibleNodes = signal<NodeSummary[]>([]);
  readonly store = inject<Store>(Store);
  readonly isLoading = signal<boolean>(true); // Lokale loading flag

  private map!: L.Map;
  private markerClusterGroup!: L.MarkerClusterGroup;
  private isMapInitialized = false;
  private babylonInstances: { [nodeId: string]: { engine: BABYLON.Engine, scene: BABYLON.Scene } } = {};

  constructor() {
    effect(() => {
      const summaries = this.allSummaries();
      // --- LOG HIER ---
      console.log(`DEBUG: Component Effect - Summaries updated, count: ${summaries?.length}`);
      if (this.isMapInitialized && summaries) {
          // --- LOG HIER ---
          console.log(`DEBUG: Component Effect - Map Initialized & Summaries exist. Calling updateMarkers/VisibleNodes...`);
          if (!Array.isArray(summaries)) { console.error("Summaries is not an array in effect!"); return; } // Extra check
          this.updateMarkers(summaries);
          this.updateVisibleNodes();
      } else {
           console.log(`DEBUG: Component Effect - Skipping update. isMapInitialized=<span class="math-inline">${this.isMapInitialized}, summaries exists=</span>${!!summaries}`);
      }
      // --- EINDE LOGS ---
    });
  }



  ngOnInit(): void {
    console.log('DEBUG: NodeOverviewMapComponent - OnInit - Calling service directly...');
    this.loading.set(true); // Zet lokale loading flag
    this.nodesService.getNodeSummaries({}) // Roep service aan
      .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => console.log("DEBUG: Service call observable started...")),
          catchError(err => {
              console.error("DEBUG: Error from nodesService.getNodeSummaries:", err);
              this.loading.set(false); // Zet loading uit bij error
              return of([]); // Retourneer lege array
          }),
          finalize(() => {
              console.log("DEBUG: Finalizing service call observable.");
              // Timeout niet strikt nodig bij signal.set
              this.loading.set(false); // Zet loading uit na afronden
          })
      )
      .subscribe({
          next: (summaries) => {
              console.log('DEBUG: Received summaries directly from service:', summaries);
              // --- WIJZIGING: Gebruik .set() op lokaal signal ---
              this.allSummaries.set(summaries ?? []);
              // --- EINDE WIJZIGING ---
          },
      });
    // --- EINDE WIJZIGING ---

    // Oude dispatch:
    // this.store.dispatch(NodesActions.loadNodes({}));
}


  ngAfterViewInit(): void {
    this.initMap();
    this.isMapInitialized = true;
    const initialSummaries = this.allSummaries();
    if (initialSummaries && initialSummaries.length > 0) {
        this.updateMarkers(initialSummaries);
    }
    this.setupMapEventListeners();
    this.updateVisibleNodes();

    console.log(this.allSummaries());
  }

  ngOnDestroy(): void {
    // Cleanup gebeurt nu grotendeels via takeUntilDestroyed
    if (this.map) {
      this.map.remove();
    }
    Object.values(this.babylonInstances).forEach(instance => instance.engine.dispose());
    this.babylonInstances = {};
  }

  private setupMapEventListeners(): void {
      if (!this.map) return;

      const onMapChange = () => { this.updateVisibleNodes(); };

      // Gebruik fromEvent voor een meer RxJS-native manier
      merge(
          fromEvent(this.map, 'moveend'),
          fromEvent(this.map, 'zoomend')
      ).pipe(
          debounceTime(100), // Optioneel: debounce om niet te vaak te triggeren
          takeUntilDestroyed(this.destroyRef) // Auto unsubscribe
      ).subscribe(onMapChange);
  }


  private initMap(): void {
    if (this.map || typeof window === 'undefined') return; // Check ook of we in browser zijn

    try {
        this.map = L.map('map', { preferCanvas: true }).setView([51.0, 5.0], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }).addTo(this.map);

        this.markerClusterGroup = L.markerClusterGroup({
          maxClusterRadius: 60,
          disableClusteringAtZoom: 16,
        });
        this.map.addLayer(this.markerClusterGroup);
        console.log('Map Initialized');
    } catch (e) {
        console.error("Failed to initialize Leaflet map:", e);
        // Toon evt. foutmelding aan gebruiker
    }
  }

  private updateMarkers(summaries: NodeSummary[]): void {
    console.log(`DEBUG: updateMarkers - STARTING SIMPLE TEST with ${summaries?.length} summaries.`);
    if (!this.markerClusterGroup || !this.isMapInitialized || !this.map) {
        console.log('DEBUG: updateMarkers - Aborted: cluster group or map not ready.');
        return;
     }

    try {
        this.markerClusterGroup.clearLayers(); // Verwijder oude markers
        console.log(`DEBUG: updateMarkers - Layers cleared. Adding simple markers...`);

        summaries.forEach((summary, index) => {
            if (!summary.location?.coordinates || typeof summary.location.coordinates.lat !== 'number' || typeof summary.location.coordinates.lng !== 'number') {
                console.warn(`DEBUG: updateMarkers - Invalid/Missing coordinates for Node ${summary.id}. Skipping.`);
                return; // continue
            }

            const latLng: L.LatLngExpression = [summary.location.coordinates.lat, summary.location.coordinates.lng];

            // --- GEBRUIK ALLEEN DE STANDAARD LEAFLET MARKER ---
            const marker = L.marker(latLng, {
                title: summary.title // Tooltip op hover
            });
            // --- EINDE STANDAARD MARKER ---

            // Voeg een simpele popup toe voor debuggen
            marker.bindPopup(`<b>${summary.title}</b><br>ID: ${summary.id}<br>Type: ${summary.type}`);

            marker.on('click', () => {
                console.log(`DEBUG: Simple Marker Clicked - ID: ${summary.id}`);
                this.navigateToNodeDetail(summary.id);
                // this.map.setView(latLng, this.map.getZoom()); // Optioneel: centreer op geklikte marker
            });

            this.markerClusterGroup.addLayer(marker); // Voeg toe aan cluster groep

        }); // Einde forEach

         console.log(`DEBUG: updateMarkers - FINISHED adding simple markers.`);

         // Optioneel: Probeer expliciete refresh na toevoegen
         // console.log('DEBUG: updateMarkers - Refreshing clusters...');
         // this.markerClusterGroup.refreshClusters();
         // setTimeout(() => this.map.invalidateSize(), 0); // Forceer map redraw

    } catch (error) {
         console.error("ERROR inside simple updateMarkers:", error);
    }
}



  private createFallbackMarker(summary: NodeSummary, latLng: L.LatLngExpression): L.Marker {
     const iconUrl = this.getIconUrl(summary.type);
     return L.marker(latLng, {
        icon: L.icon({
          iconUrl: iconUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -28]
        }),
        title: summary.title
     });
  }

  private updateVisibleNodes(): void {
    if (!this.map || !this.isMapInitialized) return;

    const bounds = this.map.getBounds();
    const summaries = this.allSummaries() || [];
    const visible = summaries.filter(summary =>
        summary.location?.coordinates &&
        bounds.contains([summary.location.coordinates.lat, summary.location.coordinates.lng])
    );
    this.visibleNodes.set(visible);
  }

  navigateToNodeDetail(nodeId: string | null | undefined): void {
    if (nodeId) {
      this.router.navigate(['/nodes', nodeId]);
    }
  }

  private createBabylonMarkerElement(summary: NodeSummary): HTMLElement {
      const container = document.createElement('div');
      container.style.position = 'relative'; // Belangrijk voor canvas positionering

      const canvas = document.createElement('canvas');
      // Unieke ID is minder kritisch nu we referentie doorgeven
      canvas.width = 80;
      canvas.height = 80;
      canvas.style.width = '40px';
      canvas.style.height = '40px';
      canvas.style.display = 'block'; // Voorkom extra ruimte
      container.appendChild(canvas);

      requestAnimationFrame(() => {
         // Controleer of canvas nog bestaat (component kan vernietigd zijn)
         if (canvas.isConnected) {
             this.initializeBabylonScene(canvas, summary.id);
         }
      });

      return container;
  }

  private initializeBabylonScene(canvas: HTMLCanvasElement, nodeId: string): void {
      if (this.babylonInstances[nodeId] || !canvas) return;

      try {
        const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, antialias: true });
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(false);
        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

        const box = BABYLON.MeshBuilder.CreateBox("box", {size: 1.2}, scene);
        const mat = new BABYLON.StandardMaterial("mat", scene);
        mat.diffuseColor = BABYLON.Color3.FromHexString("#4A90E2"); // Blauw-achtig
        mat.alpha = 0.9;
        box.material = mat;

        engine.runRenderLoop(() => {
            if (scene.isDisposed) return; // Stop loop als scene weg is
            box.rotation.y += 0.02;
            scene.render();
        });

        this.babylonInstances[nodeId] = { engine, scene };

      } catch (e) {
          console.error(`Failed to initialize Babylon scene for node ${nodeId}`, e);
      }
  }

  private getIconUrl(nodeType: NodeType): string {
      // Zorg dat deze paden kloppen!
      const basePath = 'icons/map/';
      switch (nodeType) {
          case NodeType.START: return `${basePath}start.png`; // Gebruik png/svg
          case NodeType.CHECKPOINT: return `${basePath}checkpoint.png`;
          case NodeType.QUEST: return `${basePath}quest.png`;
          case NodeType.SHOP: return `${basePath}shop.png`;
          case NodeType.END: return `${basePath}end.png`;
          // ... andere types ...
          default: return `${basePath}default-node.png`;
      }
  }
}
