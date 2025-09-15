// --- VERVANG/MAAK BESTAND AAN: libs/ui/media/src/lib/components/variant-image-manager/variant-image-manager.component.ts ---
/**
 * @file variant-image-manager.component.ts
 * @Version 2.0.0 (Bugfix: Button Size Variant & UX Refinement)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-27
 * @Description Dialoogcomponent voor het beheren en sorteren van afbeeldingen voor een specifieke productvariant.
 *              Fixes de typefout voor ButtonSize en verfijnt de UI voor een betere gebruikerservaring.
 */
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDropList, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DYNAMIC_OVERLAY_DATA, DYNAMIC_OVERLAY_REF, DynamicOverlayRef } from '@royal-code/ui/overlay';
import { Media, Image, AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { filterImageMedia } from '@royal-code/shared/utils';

export interface VariantImageData {
  allProductImages: readonly Media[];
  linkedMediaIds: string[];
  variantDisplayName: string;
}

@Component({
  selector: 'variant-image-manager',
  standalone: true,
  imports: [CommonModule, DragDropModule, CdkDropList, CdkDrag, UiIconComponent, UiButtonComponent, UiTitleComponent],
  template: `
    <div class="p-6 rounded-xs bg-card shadow-xl border border-border w-[800px] max-w-[90vw] h-[70vh] flex flex-col">
      <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'Afbeeldingen voor ' + data.variantDisplayName" />
      <p class="text-sm text-secondary mb-4">Sleep afbeeldingen om de volgorde te wijzigen. De eerste afbeelding is de hoofd-variantafbeelding.</p>
      
      <div class="grid grid-cols-2 gap-6 flex-grow overflow-hidden">
        <!-- Gekoppelde Afbeeldingen -->
        <div class="flex flex-col h-full">
          <h4 class="font-semibold mb-2">Gekoppelde Afbeeldingen</h4>
          <div class="flex-grow p-2 border border-border rounded-md bg-surface-alt overflow-y-auto"
               cdkDropList
               [cdkDropListData]="linkedImages"
               (cdkDropListDropped)="onDrop($event)">
            @for(media of linkedImages; track media.id) {
              <div class="flex items-center gap-3 p-2 mb-2 bg-card rounded-md border border-border" cdkDrag>
                <royal-code-ui-icon [icon]="AppIcon.GripVertical" extraClass="cursor-move text-muted" cdkDragHandle />
                <img [src]="getMediaUrl(media)" [alt]="getMediaAltText(media)" class="w-12 h-12 object-cover rounded-md">
                <span class="flex-grow text-sm truncate">{{ getMediaAltText(media) }}</span>
                <royal-code-ui-button type="fire" sizeVariant="icon" (clicked)="unlinkImage(media)">
                  <royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="sm" />
                </royal-code-ui-button>
              </div>
            }
            @if (linkedImages.length === 0) {
              <p class="text-center text-sm text-secondary italic p-4">Sleep afbeeldingen van rechts hierheen.</p>
            }
          </div>
        </div>

        <!-- Beschikbare Afbeeldingen -->
        <div class="flex flex-col h-full">
          <h4 class="font-semibold mb-2">Alle Productafbeeldingen</h4>
          <div class="flex-grow p-2 border border-border rounded-md bg-surface-alt overflow-y-auto">
            @for(media of availableImages; track media.id) {
               <div class="flex items-center gap-3 p-2 mb-2 bg-card rounded-md border border-transparent">
                <img [src]="getMediaUrl(media)" [alt]="getMediaAltText(media)" class="w-12 h-12 object-cover rounded-md">
                <span class="flex-grow text-sm truncate">{{ getMediaAltText(media) }}</span>
                <!-- FIX: Gebruik sizeVariant="icon" op de button en "sm" op de icon -->
                <royal-code-ui-button type="primary" sizeVariant="icon" (clicked)="linkImage(media)">
                  <royal-code-ui-icon [icon]="AppIcon.Plus" sizeVariant="sm" />
                </royal-code-ui-button>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="flex-shrink-0 pt-4 border-t border-border flex justify-end gap-3 mt-4">
        <royal-code-ui-button type="outline" (clicked)="cancel()">Annuleren</royal-code-ui-button>
        <royal-code-ui-button type="primary" (clicked)="save()">Opslaan</royal-code-ui-button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantImageManagerComponent {
  readonly data: VariantImageData = inject(DYNAMIC_OVERLAY_DATA);
  private readonly overlayRef = inject<DynamicOverlayRef<string[]>>(DYNAMIC_OVERLAY_REF);

  linkedImages: Image[];
  availableImages: Image[];

  protected readonly AppIcon = AppIcon;
  protected readonly TitleTypeEnum = TitleTypeEnum;

  constructor() {
    const allImages = filterImageMedia(this.data.allProductImages);
    const linkedIds = new Set(this.data.linkedMediaIds);
    
    this.linkedImages = this.data.linkedMediaIds
      .map(id => allImages.find(img => img.id === id))
      .filter((img): img is Image => !!img);
      
    this.availableImages = allImages.filter(img => !linkedIds.has(img.id));
  }

  onDrop(event: any) { // CdkDragDrop<Image[]>
    moveItemInArray(this.linkedImages, event.previousIndex, event.currentIndex);
  }

  linkImage(image: Image) {
    this.linkedImages.push(image);
    this.availableImages = this.availableImages.filter(img => img.id !== image.id);
  }

  unlinkImage(image: Image) {
    this.availableImages.unshift(image);
    this.linkedImages = this.linkedImages.filter(img => img.id !== image.id);
  }
  
  getMediaUrl(media: Image): string { return media.variants[0]?.url || ''; }
  getMediaAltText(media: Image): string { return media.altText || 'Product image'; }

  save() {
    this.overlayRef.close(this.linkedImages.map(img => img.id));
  }

  cancel() {
    this.overlayRef.close();
  }
}