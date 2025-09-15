/**
 * @file order-fulfillment-view.component.ts
 * @Version 2.0.0 (Upgraded with Form)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-22
 * @Description Dumb component for the 'fast lane' accordion. Displays order items,
 *              shipping address, and a form to update status to 'Shipped'.
 */
import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, OrderStatus } from '@royal-code/features/orders/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';

export interface UpdateStatusPayload {
  trackingNumber: string;
  trackingUrl: string;
}

@Component({
  selector: 'admin-order-fulfillment-view',
  standalone: true,
  imports: [CommonModule, FormsModule, UiIconComponent, UiInputComponent, UiButtonComponent, UiSpinnerComponent, UiImageComponent, UiTitleComponent],
  template: `
    <div class="p-4 bg-surface-alt">
      @if (isLoading()) {
        <div class="flex items-center justify-center p-8">
          <royal-code-ui-spinner />
        </div>
      } @else if (order()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Items -->
          <div class="md:col-span-2">
            <div class="flex items-center gap-2 mb-2">
              <royal-code-ui-icon [icon]="AppIcon.Package" sizeVariant="sm" />
              <royal-code-ui-title 
                [level]="TitleTypeEnum.H4" 
                [heading]="false" 
                text="Producten" 
                extraClasses="text-sm font-semibold !mb-0" />
            </div>
            <ul class="divide-y divide-border">
              @for (item of order().items; track item.id) {
                <li class="py-2 flex items-start justify-between gap-4">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 flex-shrink-0">
                      <royal-code-ui-image 
                        [src]="item.productImageUrl ?? 'default-image.jpg'" 
                        [alt]="item.productName" 
                        objectFit="cover" 
                        [rounded]="true" />
                    </div>
                    <div class="text-sm min-w-0">
                      <p class="font-medium text-foreground truncate" [title]="item.productName">{{ item.productName }}</p>
                      <!-- DE FIX: Toon SKU als hij bestaat, anders niets -->
                      @if(item.sku) {
                        <p class="text-xs text-muted">SKU: {{ item.sku }}</p>
                      }
                    </div>
                  </div>
                  <div class="font-mono text-sm text-foreground whitespace-nowrap pt-1 flex-shrink-0">
                    {{ item.quantity }}x
                  </div>
                </li>
              }
            </ul>
          </div>
          <!-- Verzend & Actie -->
          <div class="md:col-span-1 space-y-4">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <royal-code-ui-icon [icon]="AppIcon.Truck" sizeVariant="sm" />
                  <royal-code-ui-title 
                    [level]="TitleTypeEnum.H4" 
                    [heading]="false" 
                    text="Verzenden Naar" 
                    extraClasses="text-sm font-semibold !mb-0" />
                </div>
                @if (order().shippingAddress; as address) {
                  <div class="text-sm text-secondary leading-relaxed bg-background p-3 rounded-md border border-border">
                    <p class="font-medium text-foreground">{{ address.contactName }}</p>
                    <p>{{ address.street }} {{ address.houseNumber }}</p>
                    <p>{{ address.postalCode }} {{ address.city }}</p>
                  </div>
                } @else {
                  <p class="text-sm text-secondary italic">Geen verzendadres beschikbaar.</p>
                }
              </div>
              <div class="pt-2 border-t border-border">
                <royal-code-ui-title 
                  [level]="TitleTypeEnum.H4" 
                  [heading]="false" 
                  text="Order verzenden" 
                  extraClasses="text-sm font-semibold mb-2" />
                <div class="space-y-3">
                    <royal-code-ui-input label="Trackingnummer" [(ngModel)]="trackingNumber" />
                    <royal-code-ui-input label="Tracking URL (optioneel)" [(ngModel)]="trackingUrl" />
                    <royal-code-ui-button type="primary" (clicked)="onUpdateStatus()" [disabled]="!trackingNumber" class="m-2">
                        <royal-code-ui-icon [icon]="AppIcon.Send" /> Markeer als Verzonden
                    </royal-code-ui-button>
                </div>
              </div>
          </div>
        </div>
      }
    </div>
  `,
  // ...
})
export class OrderFulfillmentViewComponent {
  order = input.required<Order>();
  isLoading = input.required<boolean>();
  updateStatusClicked = output<UpdateStatusPayload>();

  protected readonly AppIcon = AppIcon;
  protected readonly TitleTypeEnum = TitleTypeEnum; // Voeg deze toe
  protected trackingNumber = '';
  protected trackingUrl = '';

  onUpdateStatus(): void {
    if (this.trackingNumber) {
      this.updateStatusClicked.emit({
        trackingNumber: this.trackingNumber,
        trackingUrl: this.trackingUrl,
      });
    }
  }
}
