// --- VERVANG VOLLEDIG BESTAND: libs/features/products/ui-droneshop/src/lib/pages/product-overview/product-overview.component.ts ---
/**
 * @file product-overview.component.ts
 * @Version 2.1.1 (Corrected Icons and Imports)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   A presentational component for displaying products. This version includes UI controls
 *   for sorting, view mode, sidebar visibility, and grid column count, with corrected
 *   icon references and imports.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-30
 * @PromptSummary Corrected non-existent AppIcon references and other compilation errors.
 */
import { Component, ChangeDetectionStrategy, Output, EventEmitter, signal, inject, input, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { LoggerService } from '@royal-code/core/core-logging';
import { UiListComponent, ListOrientationEnum, ListTypesEnum } from '@royal-code/ui/list';
import { Product } from '@royal-code/features/products/domain';
import { ProductListCardComponent, ProductGridComponent } from '@royal-code/ui/products';
import { ProductSortField } from '@royal-code/features/products/core';

@Component({
  selector: 'droneshop-royal-code-product-overview',
  standalone: true,
  imports: [ CommonModule, UiIconComponent, UiButtonComponent, UiListComponent, ProductListCardComponent, ProductGridComponent, TranslateModule, FormsModule ],
  changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="product-overview-content">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
        @if (!isLoading()) {
          <p class="text-sm text-secondary mb-2 sm:mb-0 order-2 sm:order-1" aria-live="polite">
            {{ products().length }} {{ products().length === 1 ? ('productOverview.productFound' | translate) : ('productOverview.productsFound' | translate) }}
          </p>
        } @else {
          <div class="h-5 order-2 sm:order-1"></div>
        }

        <div class="flex items-center space-x-4 order-1 sm:order-2">
          <!-- UI Controls -->
          <div class="flex items-center gap-2 border-r border-border pr-4">
            <royal-code-ui-button type="default" sizeVariant="icon" (clicked)="sidebarToggled.emit()" [attr.aria-label]="(isSidebarVisible() ? 'productOverview.controls.hideSidebar' : 'productOverview.controls.showSidebar') | translate">
              <royal-code-ui-icon [icon]="isSidebarVisible() ? AppIcon.PanelLeftClose : AppIcon.PanelLeftOpen" />
            </royal-code-ui-button>
            <div class="flex items-center gap-2">
              <royal-code-ui-icon [icon]="AppIcon.Grid" />
              <input type="range" [min]="2" [max]="6" [value]="gridColumns()" (input)="onGridColumnsChange($event)" class="w-24 accent-primary" />
              <span class="text-sm font-semibold">{{ gridColumns() }}</span>
            </div>
          </div>

          <div class="relative">
            <select [(ngModel)]="activeSortSelection" (ngModelChange)="handleSortChange($event)" class="block w-full px-3 py-2 border border-input rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer">
              @for (option of sortOptions; track option.value) {
                <option [value]="option.value">{{ 'productOverview.sortBy.' + option.labelKey | translate }}</option>
              }
            </select>
            <royal-code-ui-icon [icon]="AppIcon.ChevronDown" extraClass="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-secondary" sizeVariant="sm" />
          </div>

          <div class="flex space-x-2">
            <royal-code-ui-button type="default" sizeVariant="sm" (clicked)="switchView('grid')" [extraClasses]="activeViewMode() === 'grid' ? '!bg-primary !text-primary-on border-primary shadow-md' : 'text-muted-foreground hover:bg-hover'">
              <royal-code-ui-icon [icon]="AppIcon.Grid" sizeVariant="sm" extraClass="mr-1.5" />
            </royal-code-ui-button>
            <royal-code-ui-button type="default" sizeVariant="sm" (clicked)="switchView('list')" [extraClasses]="activeViewMode() === 'list' ? '!bg-primary !text-primary-on border-primary shadow-md' : 'text-muted-foreground hover:bg-hover'">
              <royal-code-ui-icon [icon]="AppIcon.List" sizeVariant="sm" extraClass="mr-1.5" />
            </royal-code-ui-button>
          </div>
        </div>
      </div>

      <!-- Product Display Area -->
      @if (isLoading()) {
        <div class="flex justify-center items-center p-10 text-secondary h-64" role="status">
          <royal-code-ui-icon [icon]="AppIcon.Loader" sizeVariant="xl" extraClass="animate-spin mr-3" />
        </div>
      } @else if (products().length > 0) {
        @if (activeViewMode() === 'grid') {
          <royal-code-ui-product-grid [products]="products()" [columnClasses]="gridColumnClasses()" />
        } @else {
          <royal-code-ui-list [list]="productsForUiList()" [itemTemplate]="productListCardTemplate" [listType]="ListTypesEnum.Custom" [listOrientation]="ListOrientationEnum.VerticalSimple" class="product-list-container space-y-3 sm:space-y-4" />
        }
      } @else {
        <div class="flex justify-center items-center p-10 text-secondary h-64" role="status">
          <royal-code-ui-icon [icon]="AppIcon.SearchX" sizeVariant="xl" extraClass="mr-3" />
        </div>
      }
    </div>

    <!-- Template for list view -->
    <ng-template #productListCardTemplate let-productItem>
      <royal-code-ui-product-list-card [productInput]="productItem" />
    </ng-template>
  `,
  styles: [`:host { display: block; width: 100%; }`]
})
export class ProductOverviewComponent {
  readonly products = input.required<readonly Product[]>();
  readonly initialViewMode = input<'grid' | 'list'>('grid');
  readonly isLoading = input<boolean>(false);
  readonly initialSortBy = input<ProductSortField>('name');
  readonly initialSortDirection = input<'asc' | 'desc'>('asc');
  readonly gridColumns = input<number>(4);
  readonly isSidebarVisible = input<boolean>(true);

  @Output() readonly viewModeChanged = new EventEmitter<'grid' | 'list'>();
  @Output() readonly sortChanged = new EventEmitter<{ sortBy: string; sortDirection: 'asc' | 'desc' }>();
  @Output() readonly gridColumnsChanged = new EventEmitter<number>();
  @Output() readonly sidebarToggled = new EventEmitter<void>();

  readonly activeViewMode = signal<'grid' | 'list'>(this.initialViewMode());
  readonly productsForUiList = computed(() => this.products() as any[]);

  readonly gridColumnClasses = computed(() => {
    const cols = this.gridColumns();
    return `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${cols > 4 ? 4 : cols} xl:grid-cols-${cols}`;
  });

  protected readonly AppIcon = AppIcon;
  protected readonly ListTypesEnum = ListTypesEnum;
  protected readonly ListOrientationEnum = ListOrientationEnum;

  readonly sortOptions = [
    { value: 'name|asc', labelKey: 'nameAsc' }, { value: 'name|desc', labelKey: 'nameDesc' },
    { value: 'price|asc', labelKey: 'priceAsc' }, { value: 'price|desc', labelKey: 'priceDesc' },
    { value: 'createdAt|desc', labelKey: 'newest' }, { value: 'popularity|desc', labelKey: 'popularity' },
  ];
  activeSortSelection = signal<string>(`${this.initialSortBy()}|${this.initialSortDirection()}`);

  constructor() {
    effect(() => {
      this.activeSortSelection.set(`${this.initialSortBy()}|${this.initialSortDirection()}`);
    }, { allowSignalWrites: true });
  }

  switchView(mode: 'grid' | 'list'): void {
    if (this.activeViewMode() !== mode) this.activeViewMode.set(mode);
  }

  handleSortChange(selection: string): void {
    const [sortBy, sortDirection] = selection.split('|') as [string, 'asc' | 'desc'];
    if (sortBy && sortDirection) this.sortChanged.emit({ sortBy, sortDirection });
  }

  onGridColumnsChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.gridColumnsChanged.emit(Number(value));
  }
}