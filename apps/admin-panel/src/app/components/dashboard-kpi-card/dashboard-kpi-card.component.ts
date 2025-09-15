/**
 * @file dashboard-kpi-card.component.ts
 * @Version 1.1.0 (Mapped to Kpi Domain Model)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Presentational component for a single Key Performance Indicator (KPI) on the dashboard, now mapped to the domain Kpi.
 */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { Kpi } from '@royal-code/features/admin-dashboard/domain'; // Import Kpi domain model

export interface KpiCardData {
  icon: AppIcon;
  label: string;
  value: number; // De hoofdwaarde van de KPI
  format?: 'currency' | 'decimal' | 'none';
  trendData?: Kpi; // De volledige Kpi-informatie, inclusief changePercentage en trendDirection
}

@Component({
  selector: 'admin-dashboard-kpi-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe, TranslateModule, UiIconComponent],
  template: `
    @if(data(); as cardData) {
      <div class="flex items-center p-4 bg-card border border-border rounded-xs shadow-sm">
        <div class="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-md">
          <royal-code-ui-icon [icon]="cardData.icon" sizeVariant="lg" />
        </div>
        <div class="ml-4 flex-grow">
          <p class="text-sm font-medium text-muted truncate">{{ cardData.label | translate }}</p>
          <p class="text-2xl font-bold text-foreground">
            @switch (cardData.format) {
              @case ('currency') { {{ cardData.value | currency:'EUR' }} }
              @case ('decimal') { {{ cardData.value | number }} }
              @default { {{ cardData.value }} }
            }
          </p>
          @if (cardData.trendData; as trend) {
            <p class="text-xs text-secondary mt-1 flex items-center"
               [ngClass]="{
                 'text-success': trend.trendDirection === 'up',
                 'text-error': trend.trendDirection === 'down',
                 'text-muted': trend.trendDirection === 'neutral'
               }">
              <royal-code-ui-icon [icon]="trend.trendDirection === 'up' ? AppIcon.TrendingUp : AppIcon.TrendingDown" sizeVariant="xs" extraClass="mr-1" />
              {{ trend.changePercentage }}% vs. vorige maand
            </p>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardKpiCardComponent {
  data = input.required<KpiCardData>();
  protected readonly AppIcon = AppIcon;
}