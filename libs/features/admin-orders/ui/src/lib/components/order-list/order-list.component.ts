/**
 * @file order-list.component.ts
 * @Version 5.0.0 (Definitive - Robust Accordion & Data Loading - Public Facade)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Definitive smart-dumb component that displays a list of orders. It manages the
 *              accordion state and triggers full order detail loading via the facade when a row is expanded.
 *              'facade' is nu protected voor template toegang.
 */
import { Component, ChangeDetectionStrategy, input, output, signal, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Order, OrderStatus } from '@royal-code/features/orders/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { AdminOrdersFacade, adminOrdersFeature } from '@royal-code/features/admin-orders/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrderFulfillmentViewComponent, UpdateStatusPayload } from '../order-fulfillment-view/order-fulfillment-view.component';
import { Store } from '@ngrx/store';
import { UiSpinnerComponent } from '@royal-code/ui/spinner'; // << DE FIX: Importeer UiSpinnerComponent >>


@Component({
  selector: 'admin-order-list',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, RouterModule,
    UiIconComponent, UiButtonComponent, OrderFulfillmentViewComponent,
    UiSpinnerComponent // << DE FIX: Voeg UiSpinnerComponent toe aan imports >>
  ],
  template: `
    <div class="bg-card border border-border rounded-xs overflow-x-auto">
      <table class="w-full text-sm text-left text-secondary whitespace-nowrap">
        <thead class="text-xs text-muted uppercase bg-surface-alt">
          <tr>
            <th scope="col" class="p-4 w-12"></th>
            <th scope="col" class="p-4">Order #</th>
            <th scope="col" class="p-4">Datum</th>
            <th scope="col" class="p-4">Klant</th>
            <th scope="col" class="p-4">Totaal</th>
            <th scope="col" class="p-4">Status</th>
            <th scope="col" class="p-4 text-right">Acties</th>
          </tr>
        </thead>
        @if (!isLoading()) {
          @for (order of orders(); track order.id) {
            <tbody class="border-b border-border last:border-b-0">
              <tr class="hover:bg-hover">
                <td class="p-2 text-center">
                  <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="toggleExpand(order)" [title]="expandedOrderId() === order.id ? 'Inklappen' : 'Snelle weergave'">
                    <royal-code-ui-icon [icon]="AppIcon.ChevronRight" sizeVariant="sm" [extraClass]="'transition-transform ' + (expandedOrderId() === order.id ? 'rotate-90' : '')"/>
                  </royal-code-ui-button>
                </td>
                <td class="p-4 font-mono text-foreground">{{ order.orderNumber }}</td>
                <td class="p-4">{{ order.orderDate.iso | date:'dd-MM-yyyy HH:mm' }}</td>
                <td class="p-4">{{ order.customerName }}</td>
                <td class="p-4">{{ order.grandTotal | currency:'EUR' }}</td>
                <td class="p-4"><span class="font-semibold">{{ order.status | titlecase }}</span></td>
                <td class="p-4 text-right">
                  <royal-code-ui-button type="outline" sizeVariant="sm" [routerLink]="['/orders', order.id]">
                    Beheren
                  </royal-code-ui-button>
                </td>
              </tr>
              @if (expandedOrderId() === order.id) {
                <tr>
                  <td colspan="7" class="p-0">
                    <!-- Bind aan de volledig geladen order van de facade -->
                    @if (facade.selectedOrder(); as detailedOrder) {
                      <admin-order-fulfillment-view 
                          [order]="detailedOrder" 
                          [isLoading]="facade.isLoading()"
                          (updateStatusClicked)="handleUpdateStatus(detailedOrder.id, $event)" />
                    } @else {
                      <div class="flex items-center justify-center p-8">
                        <royal-code-ui-spinner />
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          } @empty {
            <tbody>
              <tr>
                <td colspan="7" class="p-8 text-center">Geen orders gevonden voor de huidige filters.</td>
              </tr>
            </tbody>
          }
        } @else {
          <!-- Skeleton Loader -->
          <tbody>
            @for (_ of [1,2,3,4,5]; track $index) {
              <tr class="border-b border-border">
                <td class="p-4"><div class="h-6 w-6 bg-muted rounded-full animate-pulse"></div></td>
                <td class="p-4"><div class="h-4 bg-muted rounded animate-pulse w-24"></div></td>
                <td class="p-4"><div class="h-4 bg-muted rounded animate-pulse w-32"></div></td>
                <td class="p-4"><div class="h-4 bg-muted rounded animate-pulse w-40"></div></td>
                <td class="p-4"><div class="h-4 bg-muted rounded animate-pulse w-16"></div></td>
                <td class="p-4"><div class="h-4 bg-muted rounded animate-pulse w-20"></div></td>
                <td class="p-4 text-right"><div class="h-8 bg-muted rounded animate-pulse w-20 ml-auto"></div></td>
              </tr>
            }
          </tbody>
        }
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent {
  orders = input.required<readonly Order[]>();
  isLoading = input<boolean>(false);

  // << DE FIX: 'facade' is nu protected >>
  protected readonly facade = inject(AdminOrdersFacade);
  protected readonly AppIcon = AppIcon;
  protected readonly expandedOrderId = signal<string | null>(null);

toggleExpand(order: Order): void {
    const newId = this.expandedOrderId() === order.id ? null : order.id;
    this.expandedOrderId.set(newId);

    if (newId) {
      // Laad altijd de volledige order details wanneer de accordion wordt geopend
      this.facade.openOrderDetailPage(newId);
    } else {
      // Wis de geselecteerde order uit de facade wanneer de accordion wordt gesloten
      this.facade.selectOrder(null);
    }
  }

  handleUpdateStatus(orderId: string, payload: UpdateStatusPayload): void {
    this.facade.updateStatus(orderId, OrderStatus.shipped, payload.trackingNumber, payload.trackingUrl);
    this.expandedOrderId.set(null); // Sluit de accordion na update
  }
}