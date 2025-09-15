/**
 * @file product-list.component.ts
 * @Version 3.4.0 (Styling en Button Fixes)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-20
 * @Description Corrected styling for images and confirmed UiInputComponent for stock editing.
 */
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product, ProductStatus, isPhysicalProduct } from '@royal-code/features/products/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { UiImageComponent } from '@royal-code/ui/image';
import { UiInputComponent } from '@royal-code/ui/input';
import { FormsModule } from '@angular/forms';
import { filterImageMedia } from '@royal-code/shared/utils';
import { Image, Media } from '@royal-code/shared/domain';

@Component({
  selector: 'admin-product-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, UiIconComponent, UiButtonComponent, UiImageComponent, UiInputComponent, FormsModule],
  template: `
    <div class="bg-card border border-border rounded-xs overflow-x-auto">
      <table class="w-full text-sm text-left text-secondary whitespace-nowrap">
        <thead class="text-xs text-muted uppercase bg-surface-alt">
          <tr>
            <th scope="col" class="p-4">Product</th>
            <th scope="col" class="p-4">Status</th>
            <th scope="col" class="p-4">Voorraad</th>
            <th scope="col" class="p-4">Prijs</th>
            <th scope="col" class="p-4 text-right">Acties</th>
          </tr>
        </thead>
        <tbody>
          @for (product of products(); track product.id) {
            <tr class="border-b border-border hover:bg-hover">
              <td class="p-2 font-medium text-foreground">
                <div class="flex items-center gap-4">
                  <!-- FIX: Afbeelding container is nu een simpele div zonder negatieve marges -->
                  <div class="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    @if (getPrimaryImage(product.media); as primaryImage) {
                      <royal-code-ui-image [src]="primaryImage.variants[0].url" [alt]="product.name" objectFit="cover" extraClasses="h-full w-full" />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-secondary">
                        <royal-code-ui-icon [icon]="AppIcon.ImageOff" sizeVariant="sm" />
                      </div>
                    }
                  </div>
                  <span>{{ product.name }}</span>
                </div>
              </td>
              <td class="p-4">
                 <select
                   [ngModel]="product.status"
                   (ngModelChange)="statusChanged.emit({ productId: product.id, newStatus: $event })"
                   class="w-full p-2 border border-input rounded-md bg-background text-sm focus:ring-primary focus:border-primary">
                   @for (status of productStatuses; track status) {
                     <option [value]="status">{{ status | titlecase }}</option>
                   }
                 </select>
              </td>
              <td class="p-4">
                @if (isPhysical(product) && product.stockQuantity !== null && product.stockQuantity !== undefined) {
                  <!-- BEVESTIGING: Dit is de UiInputComponent voor directe aanpassing -->
                  <royal-code-ui-input
                    type="number"
                    [ngModel]="product.stockQuantity"
                    (ngModelChange)="stockChanged.emit({ productId: product.id, newStock: $event })"
                    extraClasses="w-24"
                  />
                } @else {
                  <span class="text-muted italic">N/A</span>
                }
              </td>
              <td class="p-4">
                @if (product.price !== null && product.price !== undefined) {
                  {{ product.price | currency:'EUR' }}
                } @else {
                  <span class="text-muted italic">Variabel</span>
                }
              </td>
              <td class="p-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <royal-code-ui-button type="outline" sizeVariant="icon" (clicked)="editClicked.emit(product.id)" title="Bewerken">
                    <royal-code-ui-icon [icon]="AppIcon.Edit" />
                  </royal-code-ui-button>
                  <royal-code-ui-button type="fire" sizeVariant="icon" (clicked)="deleteClicked.emit(product.id)" title="Verwijderen">
                    <royal-code-ui-icon [icon]="AppIcon.Trash2" />
                  </royal-code-ui-button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="5" class="p-8 text-center">Geen producten gevonden.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    td, th { vertical-align: middle; }
    .w-12.h-12 { height: 3rem; width: 3rem; }
  `]
})
export class ProductListComponent {
  products = input.required<readonly Product[]>();

  editClicked = output<string>();
  deleteClicked = output<string>();
  statusChanged = output<{ productId: string; newStatus: ProductStatus }>();
  stockChanged = output<{ productId: string; newStock: number }>();

  protected readonly AppIcon = AppIcon;
  protected readonly productStatuses = Object.values(ProductStatus);

  isPhysical(product: Product): product is Product & { stockQuantity?: number | null } {
    return isPhysicalProduct(product);
  }

  getPrimaryImage(media: readonly Media[] | null | undefined): Image | undefined {
    return filterImageMedia(media)?.[0];
  }
}