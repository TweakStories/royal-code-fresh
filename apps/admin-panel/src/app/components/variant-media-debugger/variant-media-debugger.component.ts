import { Component, ChangeDetectionStrategy, input, OnInit, signal, inject, computed, Signal } from '@angular/core'; // Voeg Signal en computed toe
import { CommonModule, JsonPipe } from '@angular/common';
import { Product, VariantAttribute, VariantAttributeValue } from '@royal-code/features/products/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { Media, Image, MediaType } from '@royal-code/shared/domain';
import { MediaFacade } from '@royal-code/features/media/core';
import { AdminProductApiService } from '@royal-code/features/admin-products/data-access';
import { BackendProductDetailDto } from '@royal-code/features/products/core';

@Component({
  selector: 'variant-media-debugger',
  standalone: true,
  imports: [CommonModule, JsonPipe],
  template: `
    <div class="p-4 border-4 border-dashed border-red-700 space-y-6">
      <!-- Bestaande Tekst Debugger -->
      <div>
        <h2 class="text-lg font-bold text-red-700">--- VARIANT MEDIA DEBUGGER (TEKST) ---</h2>
        @if (debugProductData(); as debugData) {
          <h3 class="font-semibold mt-4">Product: {{ debugData.name }} (ID: {{ debugData.id }})</h3>
          <p>Aantal variant attributen: {{ debugData.variantAttributes.length }}</p>
          @for (attr of debugData.variantAttributes; track attr.id) {
            <div class="mt-2 p-2 border border-border rounded">
              <p class="font-semibold">Attribuut: {{ attr.name }}</p>
              @for (val of attr.values; track val.id) {
                <div class="pl-4 mt-1">
                  <p class="font-mono text-sm">Value: {{ val.displayName }}</p>
                  <p class="font-mono text-xs">Media items (lengte): <strong>{{ val.mediaLength }}</strong></p>
                  <pre class="text-xs bg-surface-alt p-1 rounded-md overflow-auto">{{ val.fullMediaObjects | json }}</pre>
                </div>
              }
            </div>
          }
        } @else {
          <p class="text-destructive font-bold mt-4">GEEN PRODUCT ONTVANGEN!</p>
        }
      </div>

      <!-- Bestaande Checkbox Debugger -->
      <div class="p-4 border-4 border-dashed border-sun">
        <h2 class="text-lg font-bold text-sun">--- CHECKBOX DEBUGGER (VISUEEL) ---</h2>
        <p>Deze test leest direct uit het \`product()\` signaal en controleert de \`.media\` eigenschap.</p>
         @if (product(); as p) {
            @for(attr of p.variantAttributes; track attr.id) {
              <div class="mt-2 p-2 border border-border rounded">
                <p class="font-semibold">{{ attr.name }}</p>
                @for(val of attr.values; track val.id) {
                  <div class="pl-4 mt-1">
                    <p class="font-mono text-sm">{{ val.displayName }}</p>
                    <div class="flex flex-wrap gap-2 mt-1">
                      @for(media of uploadedMedia(); track media.id) {
                        <label class="flex items-center gap-1.5 cursor-pointer p-1 border rounded-md" [class.border-primary]="isMediaLinkedDirectly(val, media.id)" [class.border-border]="!isMediaLinkedDirectly(val, media.id)">
                          <input type="checkbox" [checked]="isMediaLinkedDirectly(val, media.id)" disabled class="h-4 w-4">
                          <img [src]="getMediaUrl(media)" [alt]="getMediaAltText(media)" class="w-6 h-6 rounded-sm object-cover">
                        </label>
                      }
                      @if(uploadedMedia().length === 0) {
                        <p class="text-xs text-secondary italic">Geen media in MediaFacade gevonden.</p>
                      }
                    </div>
                  </div>
                }
              </div>
            }
         }
      </div>

      <!-- NIEUWE SECTIE: RAW DTO FULL JSON PRINT -->
      <div class="p-4 border-4 border-dashed border-purple-700">
        <h2 class="text-lg font-bold text-purple-700">--- RAW DTO VOLLEDIGE JSON (DIRECTE API CALL) ---</h2>
        <p>Dit is de complete, onbewerkte DTO precies zoals deze van de backend komt.</p>
        @if (rawDtoFull(); as dto) {
          <pre class="text-xs  p-2 rounded-md overflow-auto">{{ dto | json }}</pre>
          <p class="font-semibold mt-4">Detailcheck: Media in 'blauw' variant:</p>
          <pre class="text-xs  p-2 rounded-md overflow-auto">{{ getBlauwVariantMedia(dto) | json }}</pre>
        } @else if (rawDtoLoading()) {
          <p class="text-blue-500 font-bold mt-4">Laden van ruwe DTO JSON...</p>
        } @else {
          <p class="text-red-700 font-bold mt-4">GEEN RUWE DTO JSON ONTVANGEN OF FOUT!</p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantMediaDebuggerComponent implements OnInit {
  product = input.required<Product>();

  private readonly logger = inject(LoggerService);
  private readonly mediaFacade = inject(MediaFacade);
  private readonly adminProductApiService = inject(AdminProductApiService);

  protected readonly uploadedMedia = this.mediaFacade.allMedia;
  protected rawDtoFull = signal<BackendProductDetailDto | undefined>(undefined);
  protected rawDtoLoading = signal(true);

  debugProductData: Signal<{ id: string; name: string; variantAttributes: { id: string; name: string; values: { id: string; displayName: string; mediaLength: number; fullMediaObjects: Media[]; }[]; }[] } | undefined> = computed(() => {
    const p = this.product();
    if (!p) return undefined;
    
    const debugAttributes = (p.variantAttributes ?? []).map(attr => ({
      id: attr.id,
      name: attr.name,
      values: (attr.values ?? []).map(val => ({
        id: val.id,
        displayName: val.displayName,
        mediaLength: (val.media ?? []).length,
        fullMediaObjects: (val.media ?? []) as Media[]
      }))
    }));
    return { id: p.id, name: p.name, variantAttributes: debugAttributes };
  });

  ngOnInit(): void {
    this.rawDtoLoading.set(true);
    this.adminProductApiService.getProductById(this.product().id).subscribe({
      next: (dto) => {
        this.rawDtoFull.set(dto);
        this.rawDtoLoading.set(false);
        this.logger.debug(`[RAW DTO FULL JSON] Raw DTO loaded into debugger. Media in 'blauw' variant:`, this.getBlauwVariantMedia(dto));
      },
      error: (err) => {
        this.logger.error(`[RAW DTO FULL JSON] Fout bij laden ruwe DTO:`, err);
        this.rawDtoFull.set(undefined);
        this.rawDtoLoading.set(false);
      }
    });
  }

  // Helper voor de RAW DTO sectie om specifieke media te tonen zonder crashes
  getBlauwVariantMedia(dto: BackendProductDetailDto): any | null {
    try {
      const colorAttr = dto.variantAttributes?.find(a => a.nameKeyOrText === 'attribute.color');
      const blauwValue = colorAttr?.values.find(v => v.value === 'blauw');
      return blauwValue?.media ?? null;
    } catch (e) {
      this.logger.error(`[getBlauwVariantMedia] Fout bij ophalen blauwe media uit DTO:`, e);
      return null;
    }
  }

  // Helpers voor de checkbox debugger
  isMediaLinkedDirectly(value: VariantAttributeValue, mediaId: string): boolean {
    const isLinked = (value.media ?? []).some(m => m.id === mediaId);
    return isLinked;
  }

  getMediaUrl(media: Media): string {
    if (media.type === MediaType.IMAGE && (media as Image).variants.length > 0) {
      return (media as Image).variants[0].url;
    }
    return (media as any).url || '';
  }

  getMediaAltText(media: Media): string {
    if (media.type === MediaType.IMAGE) {
      return (media as Image).altText || 'Media';
    }
    return (media as any).title || 'Media';
  }
}