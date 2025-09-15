/**
 * @file dashboard-recent-orders.component.ts
 * @Version 1.1.0 (Mapped to AdminDashboardOrderListItem)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Component to display a list of recent orders on the dashboard, now mapped to the domain model.
 */
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { OrderStatusPipe } from '@royal-code/features/orders/ui-plushie';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { AdminDashboardOrderListItem } from '@royal-code/features/admin-dashboard/domain'; // Import domain model
import { DateTimeInfo } from '@royal-code/shared/base-models';

// NOTE: De RecentOrder interface is verwijderd omdat we direct de AdminDashboardOrderListItem gebruiken.

@Component({
  selector: 'admin-dashboard-recent-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, CurrencyPipe, DatePipe, UiTitleComponent, UiButtonComponent, OrderStatusPipe, UiBadgeComponent],
  template: `
    <div class="bg-card border border-border rounded-xs shadow-sm h-full flex flex-col">
      <header class="p-4 border-b border-border flex justify-between items-center">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" text="Recente Orders" />
        <royal-code-ui-button type="outline" sizeVariant="sm" routerLink="/orders">
          Bekijk Alles
        </royal-code-ui-button>
      </header>
      <div class="flex-grow p-4 space-y-4 overflow-y-auto">
        @for(order of orders(); track order.id) {
          <a [routerLink]="['/orders', order.id]" class="flex items-center gap-4 group">
            @if (order.productThumbnails && order.productThumbnails.length > 0) {
              <div class="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted">
                <img [src]="order.productThumbnails[0]" [alt]="order.customerName + ' order thumbnail'" class="w-full h-full object-cover">
              </div>
            }
            <div class="flex-grow">
              <p class="font-semibold text-foreground group-hover:text-primary transition-colors">{{ order.customerName }}</p>
              <p class="text-xs text-secondary font-mono">{{ order.orderDate.iso | date:'short' }}</p>
            </div>
            <div class="flex flex-col items-end">
              <p class="font-semibold text-foreground">{{ order.grandTotal | currency:'EUR' }}</p>
              @if (order.status | orderStatusInfo; as statusInfo) {
                <royal-code-ui-badge [color]="statusInfo.color" [icon]="statusInfo.icon" size="sm">
                  {{ statusInfo.textKey | translate }}
                </royal-code-ui-badge>
              }
            </div>
          </a>
        } @empty {
          <p class="text-sm text-muted text-center pt-8">Geen recente orders gevonden.</p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardRecentOrdersComponent {
  orders = input.required<readonly AdminDashboardOrderListItem[]>(); // << DE FIX: readonly AdminDashboardOrderListItem[]
  protected readonly TitleTypeEnum = TitleTypeEnum;
}