// --- VERVANG VOLLEDIG BESTAND: libs/features/orders/ui-plushie/src/lib/pages/order-detail-page/order-detail-page.component.ts ---
/**
 * @file order-detail-page.component.ts
 * @Version 2.1.0 (Fixed: Template type-assertion)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Dit is de definitieve OrderDetailPageComponent, geoptimaliseerd om de
 *   nieuwe, herbruikbare `UiProductLineLineComponent` te gebruiken voor de
 *   weergave van individuele orderregels. De pagina is nu gestructureerd
 *   om alle details van een order overzichtelijk weer te geven, inclusief
 *   status, adressen, betaling en levering.
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, filter } from 'rxjs/operators';
import { OrdersFacade } from '@royal-code/features/orders/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { ProductLineItemData, TitleTypeEnum } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, AsyncPipe } from '@angular/common';
import { OrderItem } from '@royal-code/features/orders/domain';
import { UiProductLineItemComponent } from '@royal-code/ui/products';
import { OrderStatusPipe } from '../../pipes/order-status.pipe';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, BadgeColor } from '@royal-code/shared/domain';
import { UiCardComponent } from '@royal-code/ui/cards/card';

@Component({
  selector: 'plushie-order-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    UiTitleComponent,
    AsyncPipe,
    UiProductLineItemComponent,
    OrderStatusPipe,
    UiParagraphComponent,
    UiIconComponent,
    UiCardComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      @if (facade.selectedOrder$ | async; as order) {
        <royal-code-ui-title
          [level]="TitleTypeEnum.H1"
          [text]="('orders.detail.title' | translate) + ' ' + order.orderNumber"
          extraClasses="mb-6"
        />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Linker Kolom: Order Items & Details -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Order Status & Datum -->
            <royal-code-ui-card extraContentClasses="p-6">
              <div class="flex justify-between items-center mb-4 border-b border-border pb-4">
                <royal-code-ui-paragraph extraClasses="font-semibold text-lg">{{ 'orders.detail.orderSummary' | translate }}</royal-code-ui-paragraph>
                @if (order.status | orderStatusInfo; as statusInfo) {
                  <div class="flex items-center gap-2">
                    <royal-code-ui-icon [icon]="statusInfo.icon" [class]="getTextColorClass(statusInfo.color)" />
                    <royal-code-ui-paragraph extraClasses="font-semibold" [color]="getParagraphColor(statusInfo.color)">
                      {{ statusInfo.textKey | translate }}
                    </royal-code-ui-paragraph>
                  </div>
                }
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <royal-code-ui-paragraph color="muted">{{ 'orders.detail.orderDate' | translate }}:</royal-code-ui-paragraph>
                  <royal-code-ui-paragraph>{{ order.orderDate.iso | date:'fullDate' }}</royal-code-ui-paragraph>
                </div>
                <div>
                  <royal-code-ui-paragraph color="muted">{{ 'orders.detail.total' | translate }}:</royal-code-ui-paragraph>
                  <royal-code-ui-paragraph>{{ order.grandTotal | currency:'EUR' }}</royal-code-ui-paragraph>
                </div>
              </div>
            </royal-code-ui-card>

            <!-- Order Items List -->
            <royal-code-ui-card extraContentClasses="p-6">
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'orders.detail.items' | translate" extraClasses="mb-6" />
              <div class="space-y-4">
                @for (item of order.items; track item.id) {
                  <royal-code-ui-product-line-item [item]="mapOrderItemToProductLineItem(item)" />
                }
              </div>
            </royal-code-ui-card>
          </div>

          <!-- Rechter Kolom: Adressen, Betaling & Levering -->
          <div class="lg:col-span-1 space-y-8">
            <!-- Verzendadres -->
            @if (order.shippingAddress; as address) {
              <royal-code-ui-card extraContentClasses="p-6">
                <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'orders.detail.shippingAddress' | translate" extraClasses="mb-4" />
                <royal-code-ui-paragraph extraClasses="font-semibold">{{ address.contactName }}</royal-code-ui-paragraph>
                <royal-code-ui-paragraph>{{ address.street }} {{ address.houseNumber }}</royal-code-ui-paragraph>
                @if (address.addressAddition) {
                  <royal-code-ui-paragraph>{{ address.addressAddition }}</royal-code-ui-paragraph>
                }
                <royal-code-ui-paragraph>{{ address.postalCode }} {{ address.city }}</royal-code-ui-paragraph>
                <royal-code-ui-paragraph>{{ address.countryCode }}</royal-code-ui-paragraph>
                @if (address.phoneNumber) {
                  <royal-code-ui-paragraph>{{ 'common.phoneNumber' | translate }}: {{ address.phoneNumber }}</royal-code-ui-paragraph>
                }
                @if (address.email) {
                  <royal-code-ui-paragraph>{{ 'common.email' | translate }}: {{ address.email }}</royal-code-ui-paragraph>
                }
              </royal-code-ui-card>
            }

            <!-- Betalingsgegevens -->
            @if (order.paymentDetails; as payment) {
              <royal-code-ui-card extraContentClasses="p-6">
                <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'orders.detail.paymentDetails' | translate" extraClasses="mb-4" />
                <royal-code-ui-paragraph extraClasses="font-semibold">{{ payment.methodFriendlyName }}</royal-code-ui-paragraph>
                <royal-code-ui-paragraph size="sm" color="muted">{{ 'orders.detail.paymentStatus' | translate }}: {{ payment.paymentStatus }}</royal-code-ui-paragraph>
                @if (payment.gatewayTransactionId) {
                  <royal-code-ui-paragraph size="sm" color="muted">{{ 'orders.detail.transactionId' | translate }}: {{ payment.gatewayTransactionId }}</royal-code-ui-paragraph>
                }
              </royal-code-ui-card>
            }
            
            <!-- Leveringsgegevens -->
            @if (order.shippingDetails; as shipping) {
              <royal-code-ui-card extraContentClasses="p-6">
                <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'orders.detail.deliveryDetails' | translate" extraClasses="mb-4" />
                <royal-code-ui-paragraph extraClasses="font-semibold">{{ shipping.methodName }}</royal-code-ui-paragraph>
                @if (shipping.trackingNumber) {
                  <royal-code-ui-paragraph>{{ 'orders.detail.trackingNumber' | translate }}:
                    <a [href]="shipping.trackingUrl" target="_blank" class="text-primary hover:underline">
                      {{ shipping.trackingNumber }}
                    </a>
                  </royal-code-ui-paragraph>
                }
                @if (shipping.estimatedDeliveryDate) {
                  <royal-code-ui-paragraph>{{ 'orders.detail.estimatedDelivery' | translate }}: {{ shipping.estimatedDeliveryDate.iso | date:'fullDate' }}</royal-code-ui-paragraph>
                }
                @if (shipping.shippedDate) {
                  <royal-code-ui-paragraph>{{ 'orders.detail.shippedOn' | translate }}: {{ shipping.shippedDate.iso | date:'fullDate' }}</royal-code-ui-paragraph>
                }
              </royal-code-ui-card>
            }
          </div>
        </div>

      } @else {
        <p class="text-center text-secondary">{{ 'orders.detail.notFound' | translate }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPageComponent implements OnInit {
  protected readonly facade = inject(OrdersFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  private readonly orderId$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    filter((id): id is string => !!id)
  );
  private readonly orderId = toSignal(this.orderId$);

  ngOnInit(): void {
    const id = this.orderId();
    if (id) {
      this.facade.viewOrderDetail(id);
    }
  }

  /**
   * Returns the Tailwind CSS class for the text color based on the BadgeColor.
   * This is a workaround for the Angular template compiler not supporting `as any` directly in `[class]` bindings.
   * @param color The BadgeColor from the OrderStatusPipe.
   * @returns A string representing the Tailwind CSS class (e.g., 'text-success').
   */
  protected getTextColorClass(color: BadgeColor): string {
    return `text-${color}`;
  }

  /**
   * Returns the color for the UiParagraph component.
   * This is a workaround for the Angular template compiler not supporting `as any` directly in `[color]` bindings.
   * We assert it to `any` because the exact `ParagraphColor` type is unknown in this context.
   * @param color The BadgeColor from the OrderStatusPipe.
   * @returns The color value, cast to `any`.
   */
  protected getParagraphColor(color: BadgeColor): any {
    return color as any;
  }

  /**
   * Helper function to map an OrderItem to a ProductLineItemData for UiProductLineItemComponent.
   * @param orderItem The OrderItem to map.
   * @returns A ProductLineItemData object.
   */
  protected mapOrderItemToProductLineItem(orderItem: OrderItem): ProductLineItemData {
    return {
      id: orderItem.id,
      name: orderItem.productName,
      imageUrl: orderItem.productImageUrl,
      quantity: orderItem.quantity,
      pricePerItem: orderItem.pricePerItem,
      lineTotal: orderItem.lineTotal,
      productId: orderItem.productId,
      route: ['/products', orderItem.productId]
    };
  }
}