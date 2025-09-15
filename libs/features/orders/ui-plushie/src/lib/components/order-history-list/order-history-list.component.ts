/**
 * @file order-history-list.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-07-19
 * @Description "Dumb" presentational component voor het weergeven van een lijst met orders.
 */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Order, OrderSummary } from '@royal-code/features/orders/domain';
import { AppIcon } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { OrderHistoryCardComponent } from '../order-history-card/order-history-card.component';

@Component({
  selector: 'plushie-order-history-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    UiButtonComponent,
    UiIconComponent,
    UiParagraphComponent,
    OrderHistoryCardComponent,
  ],
  template: `
    <div class="space-y-8">
      @if (isLoading()) {
        <!-- Skeleton Loaders -->
        @for (_ of [1, 2, 3]; track $index) {
          <div class="bg-card border border-border rounded-xs shadow-sm h-40 animate-pulse"></div>
        }
      } @else if (orders().length > 0) {
        @for (order of orders(); track order.id) {
          <plushie-order-history-card [order]="order" />
        }
        <!-- Hier komt later paginatie of infinite scroll knop -->
      } @else {
        <!-- Empty State -->
        <div class="text-center p-8 border border-dashed border-border rounded-xs">
          <royal-code-ui-icon [icon]="AppIcon.Package" sizeVariant="xl" extraClass="text-secondary mb-4" />
          <royal-code-ui-paragraph color="muted">
            {{ 'orders.overview.noOrders' | translate }}
          </royal-code-ui-paragraph>
          <royal-code-ui-button type="primary" [routerLink]="['/']" extraClasses="mt-4">
            {{ 'orders.overview.startShopping' | translate }}
          </royal-code-ui-button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHistoryListComponent {
  orders = input.required<readonly Order[]>();
  isLoading = input<boolean>(false);

  protected readonly AppIcon = AppIcon;
}