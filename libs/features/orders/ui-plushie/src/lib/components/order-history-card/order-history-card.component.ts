/**
 * @file order-history-card.component.ts
 * @Version 5.0.0 (Geïntegreerde UiProductLineItemComponent)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Component voor het weergeven van een individuele bestelling in de ordergeschiedenis,
 *   nu geoptimaliseerd om de herbruikbare `UiProductLineItemComponent` te gebruiken
 *   voor de weergave van orderregels. Dit zorgt voor consistentie en stroomlijnt de code.
 */
import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Order, OrderItem } from '@royal-code/features/orders/domain';
import { AppIcon, ProductLineItemData } from '@royal-code/shared/domain';
import { CartFacade, AddCartItemPayload } from '@royal-code/features/cart/core';
import { ReviewsFacade } from '@royal-code/features/reviews/core';
import { ReviewTargetEntityType } from '@royal-code/features/reviews/domain';
import { CreateReviewFormComponent } from '@royal-code/features/reviews/ui-plushie';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiDropdownComponent } from '@royal-code/ui/dropdown';
import { OrderStatusPipe } from '../../pipes/order-status.pipe';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiProductLineItemComponent } from '@royal-code/ui/products'; // <<< NIEUW TOEGEVOEGD

@Component({
  selector: 'plushie-order-history-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    UiButtonComponent,
    UiBadgeComponent, OrderStatusPipe, UiIconComponent,
    UiDropdownComponent,
    UiProductLineItemComponent, // <<< NIEUW TOEGEVOEGD
  ],
  template: `
    @if (order(); as order) {
      <div class="bg-card border border-border rounded-xs shadow-sm">
        <!-- Card Header -->
        <header class="bg-surface-alt p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm w-full sm:w-auto">
            <div>
              <p class="uppercase font-semibold tracking-wide text-xs text-muted">{{ 'orders.card.placed' | translate }}</p>
              <p class="font-medium text-foreground">{{ order.orderDate.iso | date:'dd MMMM yyyy' }}</p>
            </div>
            <div>
              <p class="uppercase font-semibold tracking-wide text-xs text-muted">{{ 'orders.card.total' | translate }}</p>
              <p class="font-medium text-foreground">{{ order.grandTotal | currency:'EUR' }}</p>
            </div>
            <div>
              <p class="uppercase font-semibold tracking-wide text-xs text-muted">{{ 'orders.card.shipTo' | translate }}</p>
              <p class="font-medium text-foreground truncate" [title]="order.customerName">{{ order.customerName }}</p>
            </div>
            <div class="col-span-2 md:col-span-1">
              <p class="uppercase font-semibold tracking-wide text-xs text-muted">{{ 'orders.detail.orderNumber' | translate }}</p>
              <p class="font-mono text-muted text-xs sm:text-sm">{{ order.orderNumber }}</p>
            </div>
          </div>
          <div class="flex-shrink-0 self-start sm:self-center flex items-center gap-2">
            @if (order.status | orderStatusInfo; as status) {
              <royal-code-ui-badge [color]="status.color" [icon]="status.icon">
                {{ status.textKey | translate }}
              </royal-code-ui-badge>
            }
            <royal-code-ui-dropdown alignment="right">
              <royal-code-ui-button dropdown-trigger type="transparent" sizeVariant="icon" extraClasses="h-8 w-8 text-secondary">
                <royal-code-ui-icon [icon]="AppIcon.MoreVertical" sizeVariant="sm" />
              </royal-code-ui-button>
              <div dropdown class="bg-card border border-border rounded-xs shadow-lg py-1 w-48 z-dropdown">
                <button class="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-hover text-foreground">{{ 'orders.card.viewDetails' | translate }}</button>
                <button class="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-hover text-foreground">{{ 'orders.card.downloadInvoice' | translate }}</button>
              </div>
            </royal-code-ui-dropdown>
          </div>
        </header>

        <!-- Order Items Body -->
        <div class="divide-y divide-border">
          @if (order.items && order.items.length > 0) {
            @for (item of order.items; track item.id) {
              <div class="p-4">
                @if (order.shippingDetails?.shippedDate?.iso; as shippedIso) {
                  <p class="text-sm font-semibold mb-3 text-success flex items-center gap-2">
                    <royal-code-ui-icon [icon]="AppIcon.CheckCheck" sizeVariant="sm" />
                    {{ 'orders.card.deliveredOn' | translate: { date: (shippedIso | date:'dd MMMM yyyy') } }}
                  </p>
                }
                <!-- FIX: Gebruik nu de nieuwe UiProductLineItemComponent voor het item zelf -->
                <royal-code-ui-product-line-item [item]="mapOrderItemToProductLineItem(item)" />
                <div class="flex flex-col min-w-0 mt-4 sm:mt-2">
                    <div class="mt-auto pt-2 flex items-center gap-2 flex-wrap justify-end">
                      <royal-code-ui-button (clicked)="buyAgain(item)" type="primary" sizeVariant="sm" extraClasses="bg-amber-400 hover:bg-amber-500 text-black">
                        <royal-code-ui-icon [icon]="AppIcon.RotateCcw" sizeVariant="sm" extraClass="mr-2"/>
                        {{ 'orders.card.buyAgain' | translate }}
                      </royal-code-ui-button>
                      <royal-code-ui-button [routerLink]="['/products', item.productId]" type="outline" sizeVariant="sm">
                        {{ 'orders.card.viewItem' | translate }}
                      </royal-code-ui-button>
                      <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="writeReview(item)">{{ 'orders.card.writeReview' | translate }}</royal-code-ui-button>
                    </div>
                  </div>
              </div>
            }
          }
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHistoryCardComponent {
  order = input.required<Order>();
  private readonly cartFacade = inject(CartFacade);
  private readonly overlayService = inject(DynamicOverlayService);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  buyAgain(item: OrderItem): void {
    const payload: AddCartItemPayload = {
      productId: item.productId,
      quantity: item.quantity,
      variantId: item.productVariantId ?? undefined,
      productName: item.productName,
      pricePerItem: item.pricePerItem,
      productImageUrl: item.productImageUrl,
    };
    this.cartFacade.addItem(payload);
  }

  writeReview(item: OrderItem): void {
    this.overlayService.open({
      component: CreateReviewFormComponent,
      data: {
        targetEntityId: item.productId,
        targetEntityType: ReviewTargetEntityType.PRODUCT,
        context: {
          productName: item.productName,
          productImageUrl: item.productImageUrl
        }
      },
      panelClass: ['w-full', 'max-w-xl'],
      backdropType: 'dark'
    });
  }

  // <<< NIEUW TOEGEVOEGD: Helper functie om OrderItem te mappen naar ProductLineItemData >>>
  protected mapOrderItemToProductLineItem(orderItem: OrderItem): ProductLineItemData {
    return {
      id: orderItem.id,
      name: orderItem.productName,
      imageUrl: orderItem.productImageUrl,
      quantity: orderItem.quantity,
      pricePerItem: orderItem.pricePerItem,
      lineTotal: orderItem.lineTotal,
      productId: orderItem.productId,
      route: ['/products', orderItem.productId] // Maak een route als voorbeeld
    };
  }
}