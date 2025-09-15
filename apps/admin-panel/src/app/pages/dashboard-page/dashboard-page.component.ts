/**
 * @file dashboard-page.component.ts
 * @Version 4.2.1 (Cleaned - Removed Redundant DecimalPipe Import)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Definitive smart component for the admin dashboard, now cleaned of redundant DecimalPipe import.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AdminDashboardFacade } from '@royal-code/features/admin-dashboard/core';
import { Kpi } from '@royal-code/features/admin-dashboard/domain';
import { DashboardKpiCardComponent, KpiCardData } from '../../components/dashboard-kpi-card/dashboard-kpi-card.component';
import { DashboardSalesChartComponent } from '../../components/dashboard-sales-chart/dashboard-sales-chart.component';
import { DashboardRecentOrdersComponent } from '../../components/dashboard-recent-orders/dashboard-recent-orders.component';
import { DashboardRecentReviewsComponent } from '../../components/dashboard-recent-reviews/dashboard-recent-reviews.component';
import { DashboardBestsellersComponent } from '../../components/dashboard-bestsellers/dashboard-bestsellers.component';

@Component({
  selector: 'admin-dashboard-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    UiTitleComponent, UiButtonComponent, UiIconComponent,
    DashboardKpiCardComponent, DashboardSalesChartComponent,
    DashboardRecentOrdersComponent, DashboardRecentReviewsComponent,
    DashboardBestsellersComponent
    // DecimalPipe is verwijderd uit de imports, want CommonModule levert het al
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <royal-code-ui-title [level]="TitleTypeEnum.H1" text="Welkom terug, Admin!" />
        <div class="flex items-center gap-2">
          <royal-code-ui-button type="outline">
            <royal-code-ui-icon [icon]="AppIcon.Download" extraClass="mr-2" />
            Rapport Downloaden
          </royal-code-ui-button>
          <royal-code-ui-button type="primary" routerLink="/products/new">
             <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2" />
            Nieuw Product
          </royal-code-ui-button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @if (viewModel().stats; as stats) {
          <admin-dashboard-kpi-card [data]="mapKpiToCardData(AppIcon.Euro, 'Totale Omzet', stats.totalRevenue, 'currency')" />
          <admin-dashboard-kpi-card [data]="mapKpiToCardData(AppIcon.ShoppingCart, 'Verkopen', stats.totalSales, 'decimal')" />
          <admin-dashboard-kpi-card [data]="mapKpiToCardData(AppIcon.Users, 'Nieuwe Klanten', stats.newCustomers, 'decimal')" />
          <admin-dashboard-kpi-card [data]="{ icon: AppIcon.Star, label: 'Openstaande Reviews', value: stats.pendingReviewsCount, format: 'none' }" />
        } @else if (viewModel().isLoading) {
           @for (_ of [1,2,3,4]; track $index) {
             <div class="bg-card border border-border rounded-xs p-4 h-[92px] animate-pulse"></div>
           }
        }
      </div>

      <!-- Main Grid: Chart & Recent Activities -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <admin-dashboard-sales-chart [data]="viewModel().revenueChartData?.dataPoints" />
        </div>
        <div class="lg:col-span-1">
          <admin-dashboard-recent-orders [orders]="viewModel().recentOrders" />
        </div>
      </div>

      <!-- Second Row: Bestsellers & Reviews -->
       <div class="grid grid-cols-1 lg:col-span-3 gap-6">
        <div class="lg:col-span-2">
          <admin-dashboard-bestsellers [bestsellers]="viewModel().bestsellers" />
        </div>
        <div class="lg:col-span-1">
          <admin-dashboard-recent-reviews [reviews]="viewModel().pendingReviews" />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;
  private readonly facade = inject(AdminDashboardFacade);

  protected readonly viewModel = this.facade.viewModel;

  ngOnInit(): void {
    this.facade.init();
  }

  mapKpiToCardData(icon: AppIcon, label: string, kpi: Kpi, format: 'currency' | 'decimal' | 'none'): KpiCardData {
    return {
      icon: icon,
      label: label,
      value: kpi.value,
      format: format,
      trendData: kpi
    };
  }
}