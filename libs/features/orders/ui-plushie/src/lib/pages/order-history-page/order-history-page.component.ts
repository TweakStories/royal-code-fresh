/**
 * @file order-history-page.component.ts
 * @Version 5.1.0 (Definitive Tabs Implementation)
 */
import { ChangeDetectionStrategy, Component, inject, OnInit, Signal, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OrdersFacade } from '@royal-code/features/orders/core';
import { Order, OrderFilters, OrderStatus } from '@royal-code/features/orders/domain';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiTabsComponent, UiTabPanelComponent } from '@royal-code/ui/tabs';
import { OrderHistoryListComponent } from '../../components/order-history-list/order-history-list.component';
import { OrderFilterComponent } from '../../components/order-filter/order-filter.component';

@Component({
  selector: 'plushie-order-history-page',
  standalone: true,
  imports: [
    CommonModule, TranslateModule,
    UiTitleComponent, OrderHistoryListComponent, OrderFilterComponent,
    UiTabsComponent, UiTabPanelComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <header class="mb-6 md:mb-8">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H1" 
          [text]="'orders.overview.title' | translate" 
        />
        <div class="mt-4">
          <plushie-order-filter (filtersChanged)="handleFiltersChange($event)" />
        </div>
      </header>

      <main>
        <royal-code-ui-tabs [initialActiveId]="'all'" (activeTabChange)="handleTabChange($event)">
          <royal-code-ui-tab-panel [title]="'orders.overview.allOrders' | translate" id="all">
            <plushie-order-history-list [orders]="filteredOrders()" [isLoading]="isLoading()" />
          </royal-code-ui-tab-panel>

          <royal-code-ui-tab-panel [title]="'orders.overview.unshipped' | translate" id="unshipped">
             <plushie-order-history-list [orders]="filteredOrders()" [isLoading]="isLoading()" />
          </royal-code-ui-tab-panel>

          <royal-code-ui-tab-panel [title]="'orders.overview.cancelled' | translate" id="cancelled">
             <plushie-order-history-list [orders]="filteredOrders()" [isLoading]="isLoading()" />
          </royal-code-ui-tab-panel>
        </royal-code-ui-tabs>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHistoryPageComponent implements OnInit {
  protected readonly facade = inject(OrdersFacade);
  protected readonly TitleTypeEnum = TitleTypeEnum;

  private readonly allOrders: Signal<readonly Order[]> = toSignal(this.facade.orderHistory$, { initialValue: [] });
  readonly isLoading: Signal<boolean> = toSignal(this.facade.isLoading$, { initialValue: true });

  private readonly activeTab = signal<'all' | 'unshipped' | 'cancelled'>('all');
  private readonly searchTerm = signal<string>('');

  readonly filteredOrders = computed(() => {
    const orders = this.allOrders();
    const tab = this.activeTab();
    const term = this.searchTerm().toLowerCase();
    
    // Stap 1: Filter op basis van de actieve tab
    let tabFiltered = orders;
    if (tab === 'unshipped') {
      const unshippedStatuses: OrderStatus[] = [OrderStatus.awaitingFulfillment, OrderStatus.pendingPayment, OrderStatus.processing];
      tabFiltered = orders.filter(o => unshippedStatuses.includes(o.status));
    } else if (tab === 'cancelled') {
      tabFiltered = orders.filter(o => o.status === OrderStatus.cancelled);
    }

    // Stap 2: Filter het resultaat daarvan op basis van de zoekterm
    if (!term) {
      return tabFiltered;
    }
    return tabFiltered.filter(o => 
      o.orderNumber.toLowerCase().includes(term) ||
      (o.items ?? []).some(item => item.productName.toLowerCase().includes(term))
    );
  });

  ngOnInit(): void {
    this.facade.loadOrderHistory();
  }

  handleTabChange(tabId: string): void {
    this.activeTab.set(tabId as 'all' | 'unshipped' | 'cancelled');
  }

  handleFiltersChange(filters: Partial<OrderFilters>): void {
    if (filters.searchTerm !== undefined) {
      this.searchTerm.set(filters.searchTerm);
    }
  }
}