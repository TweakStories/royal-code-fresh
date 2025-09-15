/**
 * @file order-management-page.component.ts
 * @Version 1.3.0 (With Pagination)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-27
 * @Description Smart component for the admin order management dashboard, now with pagination.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { AdminOrdersFacade } from '@royal-code/features/admin-orders/core';
import { DashboardStatsComponent, OrderFilterComponent, OrderListComponent } from '@royal-code/features/admin-orders/ui';
import { OrderFilters } from '@royal-code/features/orders/domain';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiPaginationComponent } from '@royal-code/ui/pagination';

@Component({
  selector: 'admin-order-management-page',
  standalone: true,
  imports: [
    CommonModule, UiTitleComponent, DashboardStatsComponent,
    OrderFilterComponent, OrderListComponent, UiSpinnerComponent,
    UiPaginationComponent
  ],
  template: `
    @if (viewModel(); as vm) {
      <div class="space-y-6">
        <royal-code-ui-title [level]="TitleTypeEnum.H1" text="Orderbeheer" />
        
        <admin-dashboard-stats [stats]="vm.stats" />
        <admin-order-filter [lookups]="vm.lookups" (filtersChanged)="onFiltersChanged($event)" />
        <admin-order-list [orders]="vm.orders" [isLoading]="vm.isLoading" />
        
        <royal-code-ui-pagination
          [totalItems]="vm.totalCount"
          [currentPage]="vm.filters.page ?? 1"
          [pageSize]="vm.filters.pageSize ?? 20"
          (goToPage)="onPageChange($event)"
        />
      </div>
    } @else {
      <div class="flex justify-center items-center h-64">
        <royal-code-ui-spinner size="lg" />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderManagementPageComponent implements OnInit {
  protected readonly facade = inject(AdminOrdersFacade);
  protected readonly TitleTypeEnum = TitleTypeEnum;

  protected readonly viewModel = this.facade.viewModel;

  ngOnInit(): void {
    this.facade.init();
  }

  onFiltersChanged(filters: Partial<OrderFilters>): void {
    this.facade.changeFilters(filters);
  }

  onPageChange(page: number): void {
    this.facade.changeFilters({ page });
  }
}