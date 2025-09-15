/**
 * @file dashboard-bestsellers.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Presentational component to display a list of best-selling products.
 */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiImageComponent } from '@royal-code/ui/media';
import { AppIcon } from '@royal-code/shared/domain';
import { Bestseller } from '@royal-code/features/admin-dashboard/domain';

@Component({
  selector: 'admin-dashboard-bestsellers',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, CurrencyPipe, UiTitleComponent, UiImageComponent],
  template: `
    <div class="bg-card border border-border rounded-xs shadow-sm h-full flex flex-col">
      <header class="p-4 border-b border-border">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" text="Best Verkochte Producten" />
      </header>
      <div class="flex-grow p-4 space-y-4 overflow-y-auto">
        @if (bestsellers(); as items) {
          @for (item of items; track item.productId) {
            <a [routerLink]="['/products', item.productId]" class="flex items-center gap-4 group">
              <div class="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted">
                <royal-code-ui-image [src]="item.thumbnailUrl" [alt]="item.productName" objectFit="cover" class="w-full h-full" />
              </div>
              <div class="flex-grow min-w-0">
                <p class="font-semibold text-foreground group-hover:text-primary transition-colors truncate" [title]="item.productName">{{ item.productName }}</p>
                <p class="text-xs text-secondary font-mono">SKU: {{ item.sku || 'N/A' }}</p>
              </div>
              <div class="flex flex-col items-end flex-shrink-0">
                <p class="font-semibold text-foreground">{{ item.totalRevenue | currency:'EUR' }}</p>
                <p class="text-xs text-secondary">{{ item.unitsSold }} verkocht</p>
              </div>
            </a>
          } @empty {
            <p class="text-sm text-muted text-center pt-8">Geen data over bestsellers beschikbaar.</p>
          }
        } @else {
          <!-- Skeleton Loader -->
          @for (_ of [1,2,3]; track $index) {
            <div class="flex items-center gap-4 animate-pulse">
              <div class="w-12 h-12 rounded-md bg-muted"></div>
              <div class="flex-grow space-y-2">
                <div class="h-4 w-3/4 bg-muted rounded"></div>
                <div class="h-3 w-1/2 bg-muted rounded"></div>
              </div>
              <div class="w-20 h-4 bg-muted rounded"></div>
            </div>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBestsellersComponent {
  bestsellers = input.required<readonly Bestseller[]>();
  protected readonly TitleTypeEnum = TitleTypeEnum;
}