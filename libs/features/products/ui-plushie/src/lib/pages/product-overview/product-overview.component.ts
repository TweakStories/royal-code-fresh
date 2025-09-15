/**
 * @file product-overview.component.ts
 * @Version 1.1.7 (Corrected Input Type for Immutability)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-16
 * @Description
 *   A presentational component for displaying a collection of products. This
 *   version is updated to correctly handle immutable `readonly` arrays passed
 *   from NgRx-powered smart components, ensuring type safety and aligning with
 *   best practices for state management.
 */
import { Component, ChangeDetectionStrategy, Output, EventEmitter, signal, inject, input, TemplateRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

// Domain & UI Imports
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { LoggerService } from '@royal-code/core/core-logging';
import { UiGridComponent } from '@royal-code/ui/grid';
import { UiListComponent, ListOrientationEnum, ListTypesEnum } from '@royal-code/ui/list';
import { Product } from '@royal-code/features/products/domain';
import { ProductHeroCardComponent, ProductListCardComponent } from '@royal-code/ui/products';

@Component({
  selector: 'plushie-royal-code-product-overview',
  standalone: true,
  imports: [
    CommonModule,
    UiIconComponent,
    UiButtonComponent,
    UiGridComponent,
    UiListComponent,
    ProductHeroCardComponent,
    ProductListCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- BEGIN: libs/features/products/ui-plushie/src/lib/components/product-overview/product-overview.component.html -->
    <div class="product-overview-content">
      <!-- Header section: Contains product count display and view switcher buttons. -->
      <div class="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        @if (!isLoading()) {
          <p class="text-sm text-secondary mb-2 sm:mb-0 order-2 sm:order-1" aria-live="polite">
            {{ products().length }}
            {{ products().length === 1 ? 'product gevonden' : 'producten gevonden' }}
          </p>
        } @else {
          <div class="h-5 order-2 sm:order-1"></div> <!-- Placeholder to prevent layout shift -->
        }
        <div class="flex space-x-2 order-1 sm:order-2">
          <royal-code-ui-button
            type="default"
            sizeVariant="sm"
            (clicked)="switchView('grid')"
            [extraClasses]="activeViewMode() === 'grid' ? '!bg-primary !text-primary-on border-primary shadow-md' : 'text-muted-foreground hover:bg-hover'"
            aria-label="Switch to grid view"
            [attr.aria-pressed]="activeViewMode() === 'grid'">
            <royal-code-ui-icon [icon]="AppIcon.Grid" sizeVariant="sm" extraClass="mr-1.5" />
            Grid
          </royal-code-ui-button>
          <royal-code-ui-button
            type="default"
            sizeVariant="sm"
            (clicked)="switchView('list')"
            [extraClasses]="activeViewMode() === 'list' ? '!bg-primary !text-primary-on border-primary shadow-md' : 'text-muted-foreground hover:bg-hover'"
            aria-label="Switch to list view"
            [attr.aria-pressed]="activeViewMode() === 'list'">
            <royal-code-ui-icon [icon]="AppIcon.List" sizeVariant="sm" extraClass="mr-1.5" />
            Lijst
          </royal-code-ui-button>
        </div>
      </div>

      <!-- Product Display Area -->
      @if (isLoading()) {
        <div class="flex justify-center items-center p-10 text-secondary h-64" role="status">
          <royal-code-ui-icon [icon]="AppIcon.Loader" sizeVariant="xl" extraClass="animate-spin mr-3" />
          Producten worden geladen...
        </div>
      } @else {
        @if (activeViewMode() === 'grid') {
          <royal-code-ui-grid
            [data]="products()"
            [cellTemplate]="productHeroCardTemplate"
            [maxCols]="3"
            [minItemWidth]="280"
            [gap]="1"
            layoutMode="dynamic">
          </royal-code-ui-grid>
        } @else {
          <royal-code-ui-list
            [list]="productsForUiList()"
            [itemTemplate]="productListCardTemplate"
            [listType]="ListTypesEnum.Custom"
            [listOrientation]="ListOrientationEnum.VerticalSimple"
            class="product-list-container space-y-3 sm:space-y-4">
          </royal-code-ui-list>
        }
      }
    </div>

    <!-- Template for rendering ProductHeroCardComponent in grid view -->
    <ng-template #productHeroCardTemplate let-productItem>
      <div class="h-full">
        <royal-code-ui-product-hero-card [productInput]="productItem" />
      </div>
    </ng-template>

    <!-- Template for rendering ProductListCardComponent in list view -->
    <ng-template #productListCardTemplate let-productItem>
      <royal-code-ui-product-list-card [productInput]="productItem" />
    </ng-template>
    <!-- END: libs/features/products/ui-plushie/src/lib/components/product-overview/product-overview.component.html -->
  `,
  styles: [`
    /* BEGIN: libs/features/products/ui-plushie/src/lib/components/product-overview/product-overview.component.scss */
    :host {
      display: block;
      width: 100%;
    }
    /* END: libs/features/products/ui-plushie/src/lib/components/product-overview/product-overview.component.scss */
  `]
})
export class ProductOverviewComponent {
  readonly products = input.required<readonly Product[]>();
  readonly initialViewMode = input<'grid' | 'list'>('grid');
  readonly isLoading = input<boolean>(false);
  @Output() readonly viewModeChanged = new EventEmitter<'grid' | 'list'>();

  readonly activeViewMode = signal<'grid' | 'list'>(this.initialViewMode());

  // De `ui-list` component verwacht waarschijnlijk `any[]`. We kunnen de `readonly`
  // eigenschap hier veilig casten omdat we de data niet muteren.
  readonly productsForUiList = computed(() => this.products() as any[]);

  readonly AppIcon = AppIcon;
  readonly ListTypesEnum = ListTypesEnum;
  readonly ListOrientationEnum = ListOrientationEnum;

  private readonly logger = inject(LoggerService, { optional: true });
  private readonly logPrefix = '[ProductOverviewComponent]';

  constructor() {
    this.logger?.debug(`${this.logPrefix} Initialized. Initial view mode: ${this.activeViewMode()}.`);
  }

  switchView(mode: 'grid' | 'list'): void {
    if (this.activeViewMode() !== mode) {
      this.activeViewMode.set(mode);
      this.viewModeChanged.emit(mode);
      this.logger?.debug(`${this.logPrefix} View mode switched to: ${mode}.`);
    } else {
      this.logger?.debug(`${this.logPrefix} View mode switch to '${mode}' ignored (already active).`);
    }
  }
}
