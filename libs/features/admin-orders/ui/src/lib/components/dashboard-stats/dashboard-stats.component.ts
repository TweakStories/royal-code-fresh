/**
 * @file dashboard-stats.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-22
 * @Description Displays key order statistics in a card layout.
 */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AdminOrderStats } from '@royal-code/features/admin-orders/domain';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'admin-dashboard-stats',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      @if (stats(); as statData) {
        <div class="bg-card border border-border rounded-xs p-4">
          <h3 class="text-sm font-medium text-muted">Totale Omzet</h3>
          <p class="text-2xl font-semibold mt-1">{{ statData.totalRevenue | currency:'EUR' }}</p>
        </div>
        <div class="bg-card border border-border rounded-xs p-4">
          <h3 class="text-sm font-medium text-muted">Totaal Aantal Orders</h3>
          <p class="text-2xl font-semibold mt-1">{{ statData.totalOrders }}</p>
        </div>
        <div class="bg-card border border-border rounded-xs p-4">
          <h3 class="text-sm font-medium text-muted">Gem. Orderwaarde</h3>
          <p class="text-2xl font-semibold mt-1">{{ statData.averageOrderValue | currency:'EUR' }}</p>
        </div>
        <div class="bg-card border border-border rounded-xs p-4">
          <h3 class="text-sm font-medium text-muted">Wacht op verzending</h3>
          <p class="text-2xl font-semibold mt-1">{{ statData.ordersAwaitingFulfillment }}</p>
        </div>
        <div class="bg-card border border-border rounded-xs p-4">
          <h3 class="text-sm font-medium text-muted">Nieuw Vandaag</h3>
          <p class="text-2xl font-semibold mt-1">{{ statData.newOrdersToday }}</p>
        </div>
        <div class="bg-card border border-border rounded-xs p-4">
          <h3 class="text-sm font-medium text-muted">Omzet Vandaag</h3>
          <p class="text-2xl font-semibold mt-1">{{ statData.revenueToday | currency:'EUR' }}</p>
        </div>
      } @else {
        @for (_ of [1,2,3,4,5,6]; track $index) {
          <div class="bg-card border border-border rounded-xs p-4 h-[92px] animate-pulse"></div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardStatsComponent {
  stats = input<AdminOrderStats | null>();
  protected readonly AppIcon = AppIcon;
}